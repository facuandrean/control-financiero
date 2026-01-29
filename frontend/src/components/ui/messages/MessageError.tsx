import './message.css';

interface MessageErrorProps {
  message: string;
  className?: string;
}

export const MessageError = ({ message, className = "" }: MessageErrorProps) => {
  return (
    <div className={`message-error ${className}`}>
      {message}
    </div>
  );
};