import { startCase } from "lodash";
import { X } from "lucide-react";

export const ParticipantsList = ({ participants, onClose }) => {
  return (
    <div className="participants-list ">
      <div className="participants-list-header ">
        <h3>Участники ({participants.length})</h3>
        <button onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="participants-list-body">
        {participants.map((participant) => (
          <div key={participant.id} className="participants-list-item">
            <div className="relative">
              <div className="participants-list-item-avatar">
                {participant.id.charAt(0).toUpperCase()}
              </div>

              <div className="participants-list-item-avatar-icon" />
            </div>

            <span className="participants-list-item-name ">{startCase(participant.id)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

