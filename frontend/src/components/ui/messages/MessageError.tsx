import './message.css';

interface MessageErrorProps {
  message: string;
  className?: string;
}

export const MessageError = ({ message, className = "" }: MessageErrorProps) => {
  const messages = message.split('. ');
  return (
    <div className={`message-error ${className}`}>
      {messages.length > 1 && 
        <ul>
          {messages.map((msg, index) => {
            return (
              <li key={index}>{msg}.</li>
            );
          })}
        </ul>
      }
      {messages.length === 1 && <p>{messages[0]}.</p>}
    </div>
  );
};