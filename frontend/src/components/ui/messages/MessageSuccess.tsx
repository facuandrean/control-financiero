import './message.css';

interface MessageSuccessProps {
  message: string;
  className?: string;
}

export const MessageSuccess = ({ message, className = "" }: MessageSuccessProps) => {
  return (
    <div className={`message-success ${className}`}>
      {message}
    </div>
  );
}