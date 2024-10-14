import React from 'react';

const HypertextLogoWhite: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
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
            <path d="M10.5 20.25L15.75 25.5" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <path d="M15.75 10.5L10.5 15.75" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <path d="M18 11.25C19.6569 11.25 21 9.90685 21 8.25C21 6.59315 19.6569 5.25 18 5.25C16.3431 5.25 15 6.59315 15 8.25C15 9.90685 16.3431 11.25 18 11.25Z" stroke="white" strokeWidth="3"/>
            <path d="M18 30.75C19.6569 30.75 21 29.4069 21 27.75C21 26.0931 19.6569 24.75 18 24.75C16.3431 24.75 15 26.0931 15 27.75C15 29.4069 16.3431 30.75 18 30.75Z" stroke="white" strokeWidth="3"/>
            <path d="M8.25 21C9.90685 21 11.25 19.6569 11.25 18C11.25 16.3431 9.90685 15 8.25 15C6.59315 15 5.25 16.3431 5.25 18C5.25 19.6569 6.59315 21 8.25 21Z" stroke="white" strokeWidth="3"/>
            <path d="M27.75 21C29.4069 21 30.75 19.6569 30.75 18C30.75 16.3431 29.4069 15 27.75 15C26.0931 15 24.75 16.3431 24.75 18C24.75 19.6569 26.0931 21 27.75 21Z" stroke="white" strokeWidth="3"/>
        </svg>
    );
  };
  
  export default HypertextLogoWhite;