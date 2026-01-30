import './stamp.css';

export const Stamp = () => {
  return (
    <div className="stamp">
      <div className="stamp-content">
        <svg 
          className="stamp-logo" 
          viewBox="0 0 250 80" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <text 
            x="125" 
            y="55" 
            fontFamily="Rubik, sans-serif" 
            fontSize="42" 
            fontWeight="700" 
            fontStyle="italic"
            fill="#7a96b4"
            textAnchor="middle"
            letterSpacing="2"
          >
            ZYKAN
          </text>
        </svg>
      </div>
    </div>
  )
}
