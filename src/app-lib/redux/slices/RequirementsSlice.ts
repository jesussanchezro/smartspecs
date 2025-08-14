import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/smartspecs/lib/config/firebase-settings";
import { toISODate } from "@/smartspecs/app-lib/utils/firestoreTimeStamps";
import { Requirement } from "@/smartspecs/app-lib/interfaces/requirement";
import { Status } from "@/smartspecs/lib/domain/entities/Status";
import { RequirementAdapter } from "@/smartspecs/lib/adapters/RequirementAdapter";

interface RequirementState {
  requirements: Requirement[];
  loading: boolean;
  error: string | null;
  selectedRequirement: Requirement | null;
}

const initialState: RequirementState = {
  requirements: [],
  loading: false,
  error: null,
  selectedRequirement: null,
};

// Crear un nuevo requerimiento
export const createRequirement = createAsyncThunk(
  "requirements/createRequirement",
  async (requirement: Omit<Requirement, "id">, { rejectWithValue }) => {
    try {
      const timestamp = Timestamp.now();

      console.log("requirement", requirement);
      const docRef = await addDoc(collection(firestore, "requirements"), {
        ...requirement,
        responsible: requirement.responsible ?? "",
        reason: requirement.reason ?? "",
        origin: requirement.origin ?? "Dify",
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      const newRequirement = {
        id: docRef.id,
        ...requirement,
        responsible: requirement.responsible ?? "",
        reason: requirement.reason ?? "",
        origin: requirement.origin ?? "Dify",
        createdAt: toISODate(timestamp),
        updatedAt: toISODate(timestamp),
      } as Requirement;

      return RequirementAdapter.toApp(RequirementAdapter.toDomain(newRequirement));
    } catch (error) {
      console.error("Error creating requirement:", error);
      return rejectWithValue("Error al crear requerimiento");
    }
  }
);

// Actualizar requerimiento
export const updateRequirement = createAsyncThunk(
  "requirements/updateRequirement",
  async (
    { id, updatedData, historyReason }: { 
      id: string; 
      updatedData: Partial<Requirement>; 
      historyReason?: string 
    },
    { rejectWithValue }
  ) => {
    try {
      const docRef = doc(firestore, "requirements", id);
      const timestamp = Timestamp.now();

      await updateDoc(docRef, {
        ...updatedData,
        updatedAt: timestamp,
      });

      // Obtener los datos actualizados del requerimiento
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        return rejectWithValue("El requerimiento no existe");
      }

      // Guardar historial si hay un historyReason
      if (historyReason) {
        const previousData = snap.data();
        await addDoc(collection(firestore, "requirements", id, "history"), {
          changedAt: timestamp,
          changedBy: "User", // Podrías obtener el usuario actual aquí
          origin: updatedData.origin || "Manual",
          reason: historyReason, // Usar el reason específico para el historial
          meetingId: "",
          requirementId: id,
          previousState: {
            title: previousData.title,
            description: previousData.description,
            priority: previousData.priority,
            status: previousData.status,
            projectId: previousData.projectId,
            createdAt: previousData.createdAt,
            updatedAt: previousData.updatedAt,
          },
          newState: {
            ...previousData,
            ...updatedData,
          }
        });
      }

      const data = snap.data();
      const requirement = {
        id: snap.id,
        projectId: data.projectId || data.project_id,
        title: data.title || "Untitled",
        description: data.description || "",
        priority: data.priority || "medium",
        status: data.status || Status.IN_PROGRESS,
        responsible: data.responsible || "",
        reason: data.reason || "", // Mantener el reason original
        origin: data.origin || "Dify",
        createdAt: toISODate(data.createdAt),
        updatedAt: toISODate(data.updatedAt),
      } as Requirement;

      return RequirementAdapter.toApp(RequirementAdapter.toDomain(requirement));
    } catch (error) {
      console.error("Error obteniendo requerimiento por ID:", error);
      return rejectWithValue("Error al obtener requerimiento por ID");
    }
  }
);

// Eliminar requerimiento
export const deleteRequirement = createAsyncThunk(
  "requirements/deleteRequirement",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(firestore, "requirements", id));
      return id;
    } catch (error) {
      console.error("Error deleting requirement:", error);
      return rejectWithValue("Error al eliminar requerimiento");
    }
  }
);

// Obtener un requerimiento por ID
export const getRequirement = createAsyncThunk(
  "requirements/getRequirement",
  async (requirementId: string, { rejectWithValue }) => {
    try {
      const snap = await getDoc(doc(firestore, "requirements", requirementId));

      if (!snap.exists()) {
        return rejectWithValue("El requerimiento no existe");
      }

      const data = snap.data();
      const requirement = {
        id: snap.id,
        projectId: data.projectId || data.project_id,
        title: data.title || "Untitled",
        description: data.description || "",
        priority: data.priority || "medium",
        status: data.status || "pending",
        responsible: data.responsible || "",
        reason: data.reason || "",
        origin: data.origin || "Dify",
        createdAt: toISODate(data.createdAt),
        updatedAt: toISODate(data.updatedAt),
      } as Requirement;

      return RequirementAdapter.toApp(RequirementAdapter.toDomain(requirement));
    } catch (error) {
      console.error("Error obteniendo requerimiento por ID:", error);
      return rejectWithValue("Error al obtener requerimiento por ID");
    }
  }
);

// Obtener requerimientos por proyecto
export const getRequirementsByProject = createAsyncThunk(
  "requirements/getRequirementsByProject",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const q = query(
        collection(firestore, "requirements"),
        where("projectId", "==", projectId)
      );

      const snap = await getDocs(q);

      const requirements = snap.docs.map((doc) => {
        const data = doc.data();
        const requirement = {
          id: doc.id,
          projectId: data.projectId || data.project_id,
          title: data.title || "Untitled",
          description: data.description || "",
          priority: data.priority || "medium",
          status: data.status || Status.IN_PROGRESS,
          responsible: data.responsible || "",
          reason: data.reason || "",
          origin: data.origin || "Dify",
          createdAt: toISODate(data.createdAt),
          updatedAt: toISODate(data.updatedAt),
        } as Requirement;

        return RequirementAdapter.toApp(RequirementAdapter.toDomain(requirement));
      });

      return requirements;
    } catch (error) {
      console.error("Error fetching requirements:", error);
      return rejectWithValue("Error al obtener requerimientos");
    }
  }
);

export const loadRequirements = createAsyncThunk(
  "requirements/loadRequirements",
  async (projectId: string, { rejectWithValue }) => {
    try {      
      const q = query(
        collection(firestore, "requirements"),
        where("projectId", "==", projectId)
      );

      const snap = await getDocs(q);

      const requirements = snap.docs.map((doc) => {
        const data = doc.data();
        const requirement = {
          id: doc.id,
          projectId: data.projectId || data.project_id,
          title: data.title || "Untitled",
          description: data.description || "",
          priority: data.priority || "medium",
          status: data.status || Status.IN_PROGRESS,
          responsible: data.responsible || "",
          reason: data.reason || "",
          origin: data.origin || "Dify",
          createdAt: toISODate(data.createdAt),
          updatedAt: toISODate(data.updatedAt),
        } as Requirement;

        return RequirementAdapter.toApp(RequirementAdapter.toDomain(requirement));
      });

      return requirements;
    } catch (error) {
      console.error("Error loading requirements:", {error});
      return rejectWithValue("Error loading requirements");
    }
  }
);

// Slice
const requirementSlice = createSlice({
  name: "requirements",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Crear requerimiento
      .addCase(createRequirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequirement.fulfilled, (state, action: PayloadAction<Requirement>) => {
        state.loading = false;
        state.error = null;
        state.requirements.push(action.payload);
      })
      .addCase(createRequirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Actualizar requerimiento
      .addCase(updateRequirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRequirement.fulfilled, (state, action: PayloadAction<Requirement>) => {
        state.loading = false;
        state.error = null;
        const index = state.requirements.findIndex(
          (req) => req.id === action.payload.id
        );
        if (index !== -1) {
          state.requirements[index] = action.payload;
        }
      })
      .addCase(updateRequirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Eliminar requerimiento
      .addCase(deleteRequirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRequirement.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = null;
        state.requirements = state.requirements.filter(
          (req) => req.id !== action.payload
        );
      })
      .addCase(deleteRequirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Obtener requerimiento por ID
      .addCase(getRequirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRequirement.fulfilled, (state, action: PayloadAction<Requirement>) => {
        state.loading = false;
        state.error = null;
        state.selectedRequirement = action.payload;
      })
      .addCase(getRequirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Obtener requerimientos por proyecto
      .addCase(getRequirementsByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRequirementsByProject.fulfilled, (state, action: PayloadAction<Requirement[]>) => {
        state.loading = false;
        state.error = null;
        state.requirements = action.payload;
      })
      .addCase(getRequirementsByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default requirementSlice.reducer;