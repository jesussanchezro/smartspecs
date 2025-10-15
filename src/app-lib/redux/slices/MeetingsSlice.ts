import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/smartspecs/lib/config/firebase-settings";
import { toISODate } from "@/smartspecs/app-lib/utils/firestoreTimeStamps";
import { Meeting } from "../../interfaces/meeting";

interface MeetingState {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
}

const initialState: MeetingState = {
  meetings: [],
  loading: false,
  error: null,
};

// Crear Reunión
export const createMeeting = createAsyncThunk(
  "meetings/createMeeting",
  async (
    newMeeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(firestore, "meetings"), {
        ...newMeeting,
        createdAt: now,
        updatedAt: now,
      });

      return {
        id: docRef.id,
        ...newMeeting,
        createdAt: toISODate(now),
        updatedAt: toISODate(now),
      } as Meeting;
    } catch (error) {
      console.error("❌ Error al crear la reunión:", error);
      return rejectWithValue("Error al crear la reunión");
    }
  }
);

// Actualizar Reunión
export const updateMeeting = createAsyncThunk(
  "meetings/updateMeeting",
  async (
    { id, updatedData }: { id: string; updatedData: Partial<Meeting> },
    { rejectWithValue }
  ) => {
    try {
      const updatedAt = Timestamp.now();
      await updateDoc(doc(firestore, "meetings", id), {
        ...updatedData,
        updatedAt,
      });

      const snap = await getDoc(doc(firestore, "meetings", id));
      const data = snap.data();

      return {
        id: snap.id,
        projectId: data?.projectId ?? "",
        title: data?.title ?? "",
        description: data?.description ?? "",
        transcription: data?.transcription ?? "",
        createdAt: toISODate(data?.createdAt),
        updatedAt: toISODate(data?.updatedAt),
      } as Meeting;
    } catch (error) {
      console.error("❌ Error actualizando la reunión:", error);
      return rejectWithValue("Error al actualizar la reunión");
    }
  }
);

// Eliminar reunión
export const deleteMeeting = createAsyncThunk(
  "meetings/deleteMeeting",
  async (meetingId: string, { rejectWithValue }) => {
    try {
      // use soft-deletion for meeting
      const timestamp = Timestamp.now();
      await updateDoc(doc(firestore, "meetings", meetingId), {
        deletedAt: timestamp,
      });
      return meetingId;
    } catch (error) {
      console.error("❌ Error eliminando reunión:", error);
      return rejectWithValue("Error al eliminar la reunión");
    }
  }
);

// Obtener Reunión
export const getMeeting = createAsyncThunk(
  "meetings/getMeeting",
  async (meetingId: string, { rejectWithValue }) => {
    try {
      const snap = await getDoc(doc(firestore, "meetings", meetingId));

      if (!snap.exists()) {
        return rejectWithValue("La reunión no existe");
      }

      const data = snap.data();
      return {
        id: snap.id,
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        transcription: data.transcription,
        createdAt: toISODate(data.createdAt),
        updatedAt: toISODate(data.updatedAt),
      } as Meeting;
    } catch (error) {
      console.error("❌ Error obteniendo reunión:", error);
      return rejectWithValue("Error al obtener la reunión");
    }
  }
);

// Obtener todas las reuniones de un proyecto
export const getMeetingsByProject = createAsyncThunk(
  "meetings/getMeetingsByProject",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const q = query(
        collection(firestore, "meetings"),
        where("projectId", "==", projectId)
      );

      const snap = await getDocs(q);

      const meetings: Meeting[] = []
      snap.docs.map((doc) => {
        const data = doc.data();
        const meeting = {
          id: doc.id,
          projectId: data.projectId,
          title: data.title ?? "",
          description: data.description ?? "",
          transcription: data.transcription ?? "",
          createdAt: toISODate(data.createdAt),
          updatedAt: toISODate(data.updatedAt),
          deletedAt: data.deletedAt ? toISODate(data.deletedAt) : undefined,
        };

        // show only not deleted meetings
        if (meeting.deletedAt === undefined) {
          meetings.push(meeting);
        }
      });

      return meetings;
    } catch (error) {
      console.error("❌ Error al obtener reuniones del proyecto:", error);
      return rejectWithValue("Error al obtener reuniones");
    }
  }
);

// Eliminar todas las reuniones de un proyecto
export const deleteAllMeetingsByProject = createAsyncThunk(
  "meetings/deleteAllMeetingsByProject",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const q = query(
        collection(firestore, "meetings"),
        where("projectId", "==", projectId)
      );

      const snap = await getDocs(q);
      
      // Eliminar todos los documentos encontrados
      const deletePromises = snap.docs.map((docSnapshot) =>
        deleteDoc(doc(firestore, "meetings", docSnapshot.id))
      );

      await Promise.all(deletePromises);

      return projectId;
    } catch (error) {
      console.error("❌ Error eliminando todas las reuniones:", error);
      return rejectWithValue("Error al eliminar reuniones");
    }
  }
);

const meetingsSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeeting.fulfilled, (state, action: PayloadAction<Meeting>) => {
        state.loading = false;
        state.meetings.push(action.payload);
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getMeetingsByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMeetingsByProject.fulfilled, (state, action: PayloadAction<Meeting[]>) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(getMeetingsByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMeeting.fulfilled, (state, action: PayloadAction<Meeting>) => {
        state.loading = false;
        const idx = state.meetings.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) {
          state.meetings[idx] = action.payload;
        } else {
          state.meetings.push(action.payload);
        }
      })
      .addCase(getMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload as Meeting;
        const idx = state.meetings.findIndex((m) => m.id === updated.id);
        if (idx !== -1) {
          state.meetings[idx] = updated;
        }
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeeting.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.meetings = state.meetings.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteAllMeetingsByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllMeetingsByProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        // Clear all meetings for the specified project
        state.meetings = state.meetings.filter((m) => m.projectId !== action.payload);
      })
      .addCase(deleteAllMeetingsByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default meetingsSlice.reducer;