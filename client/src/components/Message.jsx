import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const Message = ({ msg }) => {
  return (
    <div style={{ padding: '10px' }}>
      {msg.length === 0 ? (
        <p className="text-center text-muted">No messages yet...</p>
      ) : (
        msg.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.sender ? 'flex-end' : 'flex-start',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                padding: '10px 15px',
                maxWidth: '60%',
                borderRadius: '20px',
                backgroundColor: m.sender ? '#007bff' : '#e0e0e0',
                color: m.sender ? 'white' : 'black',
                fontSize: '1rem',
                wordWrap: 'break-word',
                display: 'flex',
                alignItems: 'flex-end', // Aligns the tick icon at the bottom
                position: 'relative',
              }}
            >
              <span>{m.text}</span>
              {m.sender && m.read &&
                <FontAwesomeIcon
                  icon={faCheck}
                  style={{
                    marginLeft: '10px',
                    fontSize: '0.8rem',
                    color: 'white',
                    position: 'relative',
                    top: '1px', // Adjusts the vertical position of the tick icon
                  }}
                />
              }
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Message;
