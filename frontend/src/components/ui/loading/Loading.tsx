import './loading.css';

interface LoadingProps {
  className?: string;
}

export const Loading = ({ className }: LoadingProps) => {
  return (
    <span className={`loader ${className}`} />
  )
}