"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, deleteDoc, doc, addDoc, where, Timestamp } from "firebase/firestore";
import { firestore } from "@/smartspecs/lib/config/firebase-settings";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/smartspecs/app-lib/redux/store";
import { processDifyWorkflow } from "@/smartspecs/app-lib/utils/difyProcessor";
import { Requirement } from "@/smartspecs/app-lib/interfaces/requirement";
import PendingMeetingsHeader from "./components/PendingMeetingsHeader";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import PendingMeetingsList from "./components/PendingMeetingsList";
import LoadingSpinner from "@/smartspecs/app-lib/components/common/LoadingSpinner";
import RequireAuth from "@/smartspecs/app-lib/components/auth/RequireAuth";

interface PendingMeeting {
  id: string;
  title: string;
  description: string;
  transcription: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    transcriptId: string;
    meetingId: string;
    date: string;
    duration: number;
    participantEmails: string[];
    host: string;
    organizer: string;
    url: string;
    eventType: string;
    clientReferenceId?: string;
  };
}

const PendingMeetingsView: React.FC = () => {
  const [meetings, setMeetings] = useState<PendingMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingMeetingId, setAcceptingMeetingId] = useState<string | null>(null);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  const { currentUser } = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (currentUser) {
      fetchMeetings();
    }
  }, [currentUser]);

  const fetchMeetings = async () => {
    if (!currentUser) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const meetingsCollection = collection(firestore, "pending-meetings");
      
      // Get all meetings ordered by creation date
      const meetingsQuery = query(
        meetingsCollection, 
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(meetingsQuery);
      
      const allMeetings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PendingMeeting[];
      
      // Filter meetings where current user is host OR participant
      const userMeetings = allMeetings.filter(meeting => {
        const userEmail = currentUser.email;
        const hostEmail = meeting.metadata?.host;
        const participantEmails = meeting.metadata?.participantEmails || [];
        
        // Check if user is the host
        if (hostEmail === userEmail) {
          return true;
        }
        
        // Check if user is in participants list
        if (participantEmails.includes(userEmail)) {
          return true;
        }
        
        return false;
      });
      
      console.log(`📊 Found ${allMeetings.length} total meetings, ${userMeetings.length} for user ${currentUser.email}`);
      setMeetings(userMeetings);
    } catch (err: any) {
      console.error("Error fetching meetings:", err);
      setError(err.message || "Error loading meetings");
    } finally {
      setLoading(false);
    }
  };

  const acceptMeeting = async (meetingId: string) => {
    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }

    setAcceptingMeetingId(meetingId);
    
    try {
      // 1. Find the first project for the current user (simplified query)
      const projectsCollection = collection(firestore, "projects");
      const projectsQuery = query(
        projectsCollection,
        where("userId", "==", currentUser.id)
      );
      
      const projectsSnapshot = await getDocs(projectsQuery);
      
      if (projectsSnapshot.empty) {
        toast.error("No projects found. Please create a project first.");
        return;
      }

      // Sort by createdAt in memory to get the most recent project
      const projects = projectsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          client: data.client,
          createdAt: data.createdAt,
          ...data
        };
      });

      // Sort by createdAt descending (most recent first)
      projects.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime.getTime() - aTime.getTime();
      });

      const firstProject = projects[0];
      const projectId = firstProject.id;

      // 2. Get the pending meeting data
      const pendingMeeting = meetings.find(m => m.id === meetingId);
      if (!pendingMeeting) {
        toast.error("Meeting not found");
        return;
      }

      // 3. Create a new meeting in the meetings collection
      const meetingsCollection = collection(firestore, "meetings");
      const now = Timestamp.now();
      
      const meetingData = {
        projectId: projectId,
        title: pendingMeeting.title,
        description: pendingMeeting.description,
        transcription: pendingMeeting.transcription,
        createdAt: now,
        updatedAt: now
      };

      const meetingDocRef = await addDoc(meetingsCollection, meetingData);
      const createdMeetingId = meetingDocRef.id;

      // 4. Get existing requirements for the project
      const requirementsCollection = collection(firestore, "requirements");
      const requirementsQuery = query(
        requirementsCollection,
        where("projectId", "==", projectId)
      );
      const requirementsSnapshot = await getDocs(requirementsQuery);
      
      const existingRequirements = requirementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Requirement[];

      // 5. Process with Dify workflow
      await processDifyWorkflow({
        dispatch,
        projectId: projectId,
        meetingId: createdMeetingId,
        projectTitle: firstProject.title || "",
        projectDescription: firstProject.description || "",
        projectClient: firstProject.client || "",
        meetingTitle: pendingMeeting.title,
        meetingDescription: pendingMeeting.description,
        meetingTranscription: pendingMeeting.transcription,
        requirementsList: existingRequirements,
        status: "new"
      });

      // 6. Delete the pending meeting
      const pendingMeetingRef = doc(firestore, "pending-meetings", meetingId);
      await deleteDoc(pendingMeetingRef);

      // 7. Update local state
      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));

      toast.success(`Meeting accepted, linked to project "${firstProject.title}"`);

    } catch (err: any) {
      console.error("Error accepting meeting:", err);
      toast.error("Failed to accept meeting");
    } finally {
      setAcceptingMeetingId(null);
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    setDeletingMeetingId(meetingId);
    
    try {
      const meetingRef = doc(firestore, "pending-meetings", meetingId);
      await deleteDoc(meetingRef);
      
      // Update local state to remove the deleted meeting
      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
      
      toast.success("Meeting deleted successfully");
    } catch (err: any) {
      console.error("Error deleting meeting:", err);
      toast.error("Failed to delete meeting");
    } finally {
      setDeletingMeetingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 bg-background text-text">
      <PendingMeetingsHeader onRefresh={fetchMeetings} />

      {error && <ErrorState error={error} />}

      {meetings.length === 0 ? (
        <EmptyState />
      ) : (
        <PendingMeetingsList 
          meetings={meetings} 
          onDelete={deleteMeeting} 
          onAccept={acceptMeeting}
          acceptingMeetingId={acceptingMeetingId}
          deletingMeetingId={deletingMeetingId}
        />
      )}
    </div>
  );
};

export default function PendingMeetingsPage() {
  return (
    <RequireAuth>
      <PendingMeetingsView />
    </RequireAuth>
  );
} 