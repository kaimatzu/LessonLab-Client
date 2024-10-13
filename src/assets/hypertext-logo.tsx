import React from 'react';

const HypertextLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
      <svg
          width={props.width || "36"}
          height={props.height || "36"}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={props.className}  // Pass className through props
          {...props}  // Spread other props such as className, style, etc.
      >
          <path d="M10.5 20.25L15.75 25.5" stroke="#193468" stroke-width="3" stroke-linecap="round"/>
          <path d="M15.75 10.5L10.5 15.75" stroke="#193468" stroke-width="3" stroke-linecap="round"/>
          <path d="M18 11.25C19.6569 11.25 21 9.90685 21 8.25C21 6.59315 19.6569 5.25 18 5.25C16.3431 5.25 15 6.59315 15 8.25C15 9.90685 16.3431 11.25 18 11.25Z" stroke="url(#paint0_linear_20_115)" stroke-width="3"/>
          <path d="M18 30.75C19.6569 30.75 21 29.4069 21 27.75C21 26.0931 19.6569 24.75 18 24.75C16.3431 24.75 15 26.0931 15 27.75C15 29.4069 16.3431 30.75 18 30.75Z" stroke="#193468" stroke-width="3"/>
          <path d="M8.25 21C9.90685 21 11.25 19.6569 11.25 18C11.25 16.3431 9.90685 15 8.25 15C6.59315 15 5.25 16.3431 5.25 18C5.25 19.6569 6.59315 21 8.25 21Z" stroke="#193468" stroke-width="3"/>
          <path d="M27.75 21C29.4069 21 30.75 19.6569 30.75 18C30.75 16.3431 29.4069 15 27.75 15C26.0931 15 24.75 16.3431 24.75 18C24.75 19.6569 26.0931 21 27.75 21Z" stroke="url(#paint1_linear_20_115)" stroke-width="3"/>
          <defs>
          <linearGradient id="paint0_linear_20_115" x1="21" y1="8.25" x2="15" y2="8.25" gradientUnits="userSpaceOnUse">
          <stop stop-color="#5E77D3"/>
          <stop offset="0.915" stop-color="#193468"/>
          </linearGradient>
          <linearGradient id="paint1_linear_20_115" x1="27.75" y1="15" x2="27.75" y2="21" gradientUnits="userSpaceOnUse">
          <stop stop-color="#5E77D3"/>
          <stop offset="0.69" stop-color="#193468"/>
          </linearGradient>
          </defs>
      </svg>
  );
};
  
export default HypertextLogo;