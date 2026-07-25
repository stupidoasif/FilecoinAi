const fs = require('fs');

const svg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#1b64f2" />
  <g transform="translate(50, 50)">
    <circle cx="0" cy="-10" r="22" fill="white" />
    <circle cx="-20" cy="5" r="20" fill="white" />
    <circle cx="20" cy="5" r="20" fill="white" />
    <circle cx="-10" cy="18" r="18" fill="white" />
    <circle cx="10" cy="18" r="18" fill="white" />
    <circle cx="-32" cy="10" r="14" fill="white" />
    <circle cx="32" cy="10" r="14" fill="white" />
    <circle cx="0" cy="5" r="25" fill="white" />
    
    <rect x="-12" y="-5" width="8" height="16" rx="4" fill="#1b64f2" />
    <rect x="4" y="-5" width="8" height="16" rx="4" fill="#1b64f2" />
  </g>
</svg>
`;

// wait we just need the inner part since the outer is the div
