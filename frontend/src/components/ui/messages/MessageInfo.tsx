import './message.css';

interface MessageInfoProps {
  message: string;
  className?: string;
}

export const MessageInfo = ({ message, className = "" }: MessageInfoProps) => {
  if (!message || typeof message !== 'string') return null;
  const messages = message.split('. ');
  return (
    <div className={`message-info ${className}`}>
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