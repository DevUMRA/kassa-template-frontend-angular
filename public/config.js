// Жергілікті әзірлеу: apiUrl бос — сұраныстар сол доменге (/api), `ng serve` оларды proxy.conf.json
// бойынша http://localhost:8000-ге жібереді. Docker бейнесінде бұл файлды entrypoint API_URL-ден жасайды.
window.__APP_CONFIG__ = { apiUrl: '' };
