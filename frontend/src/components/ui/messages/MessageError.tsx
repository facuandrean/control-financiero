import './message.css';

interface MessageErrorProps {
  message?: string | null;
  className?: string;
}

export const MessageError = ({ message, className = "" }: MessageErrorProps) => {
  if (!message) return null;

  const rawText = typeof message === 'string' ? message : String(message);
  if (!rawText.trim()) return null;

  const messages = rawText
    .split('. ')
    .map((msg) => msg.trim())
    .filter(Boolean);

  const formatMsg = (msg: string) => (msg.endsWith('.') ? msg : `${msg}.`);

  return (
    <div className={`message-error ${className}`}>
      {messages.length > 1 ? (
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{formatMsg(msg)}</li>
          ))}
        </ul>
      ) : (
        <p>{formatMsg(messages[0] || rawText)}</p>
      )}
    </div>
  );
};