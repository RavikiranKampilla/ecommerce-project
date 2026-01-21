useEffect(() => {
  const checkBackend = async () => {
    try {
      await api.get("/ping");
      setTimeout(() => {
        setReady(true);
        setChecking(false);
      }, 1500); // 👈 FORCE visible loader
    } catch {
      setReady(false);
      setChecking(false);
    }
  };

  checkBackend();
}, []);
