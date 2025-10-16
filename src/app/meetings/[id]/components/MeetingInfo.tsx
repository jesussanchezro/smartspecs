import { Meeting } from "@/smartspecs/app-lib/interfaces/meeting";

const MeetingInfo: React.FC<{
  meeting: Meeting,
  setIsEditing: (value: boolean) => void,
  setShowDeleteModal: (value: boolean) => void
}> = ({ meeting, setIsEditing, setShowDeleteModal }) => (
  <div className="border border-gray-200 rounded-lg p-6 w-full shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
    <div className="flex justify-end gap-2 mb-4">
      <button
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors duration-200 font-medium flex items-center gap-2"
        onClick={() => setIsEditing(true)}
      >
        <i className="fas fa-edit"></i>
        Edit
      </button>
      <button
        className="bg-danger text-white px-4 py-2 rounded-md hover:bg-danger/90 transition-colors duration-200 font-medium flex items-center gap-2"
        onClick={() => setShowDeleteModal(true)}
      >
        <i className="fas fa-trash"></i>
        Delete
      </button>
    </div>
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{meeting.title}</h2>
        <p className="text-gray-600 text-sm">
          {meeting.createdAt ? new Date(meeting.createdAt).toLocaleString() : "Sin fecha"}
        </p>
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
          <p className="text-gray-700">{meeting.description}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Transcription</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            {meeting.transcription ? (
              <p className="text-gray-700 whitespace-pre-wrap">{meeting.transcription}</p>
            ) : (
              <p className="text-gray-400 italic">No transcription available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MeetingInfo; 