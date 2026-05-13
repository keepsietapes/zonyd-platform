self.onmessage = (e) => {
  const { type } = e.data;

  if (type === 'START_MASTERING') {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 1;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        self.postMessage({
          type: 'MASTERING_COMPLETE',
          payload: {
            lufs: -14.2,
            truePeak: -1.0,
            status: 'success'
          }
        });
      } else {
        self.postMessage({
          type: 'MASTERING_PROGRESS',
          payload: { progress }
        });
      }
    }, 80);
  }
};
