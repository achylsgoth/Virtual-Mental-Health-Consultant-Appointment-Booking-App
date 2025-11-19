// A simple wave border component to add an organic feel
const WaveBorderComponent = ({ color }) => {
    return (
      <Box sx={{ overflow: 'hidden', width: '100%', height: '40px' }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path
            d="M0,32 C320,80 420,80 720,48 C1020,16 1120,16 1440,64 L1440,120 L0,120 Z"
            fill={color}
          />
        </svg>
      </Box>
    );
  };