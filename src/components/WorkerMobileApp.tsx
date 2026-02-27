import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Pause, Square, Coffee, MapPin, Wifi, WifiOff, 
  Battery, Signal, User, Calendar, CheckCircle, AlertTriangle,
  Phone, Bell, Settings, LogOut, RefreshCw, Navigation,
  Timer, Home, FileText, Eye
} from 'lucide-react';

interface WorkerMobileAppProps {
  workerId: string;
  workerName: string;
}

const WorkerMobileApp: React.FC<WorkerMobileAppProps> = ({ workerId, workerName }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWorking, setIsWorking] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Simular datos del operario
  const workerData = {
    code: 'OP-001',
    project: 'Autopista A-7 Valencia',
    schedule: {
      start: '07:00',
      end: '15:00',
      totalHours: 8
    },
    todayStatus: {
      clockedIn: true,
      clockInTime: '07:00',
      scheduledBreaks: [
        { name: 'Café', time: '10:30', duration: 15 },
        { name: 'Comida', time: '13:00', duration: 30 }
      ]
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simular geolocalización
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Error getting location:', error)
      );
    }

    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    setIsWorking(true);
    setWorkStartTime(new Date());
    console.log('Fichaje de entrada registrado');
  };

  const handleClockOut = () => {
    setIsWorking(false);
    setWorkStartTime(null);
    console.log('Fichaje de salida registrado');
  };

  const handleStartBreak = (type: 'coffee' | 'lunch' | 'personal') => {
    setIsOnBreak(true);
    setBreakStartTime(new Date());
    console.log(`Inicio de descanso: ${type}`);
  };

  const handleEndBreak = () => {
    setIsOnBreak(false);
    setBreakStartTime(null);
    console.log('Fin de descanso registrado');
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getWorkingTime = (): string => {
    if (!workStartTime) return '00:00:00';
    const diff = currentTime.getTime() - workStartTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-corporate-blue-600 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold">{workerName}</h1>
              <p className="text-sm opacity-90">{workerData.code}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-300" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-300" />
              )}
              <Signal className="h-4 w-4" />
              <Battery className="h-4 w-4" />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold">{formatTime(currentTime)}</div>
          <div className="text-sm opacity-90">
            {currentTime.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="text-center">
            <div className="mb-4">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                isWorking ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Clock className={`h-8 w-8 ${isWorking ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isWorking ? 'Trabajando' : 'Fuera de Jornada'}
            </h2>
            
            {isWorking && (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-corporate-blue-600">
                  {getWorkingTime()}
                </div>
                <div className="text-sm text-gray-600">
                  Inicio: {workStartTime ? formatTime(workStartTime) : '-'}
                </div>
                {isOnBreak && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2">
                      <Coffee className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">En descanso</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <MapPin className="h-5 w-5 text-corporate-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">{workerData.project}</h3>
              <p className="text-sm text-gray-600">Horario: {workerData.schedule.start} - {workerData.schedule.end}</p>
            </div>
          </div>
          
          {location && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">Ubicación verificada</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isWorking ? (
            <button
              onClick={handleClockIn}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-2"
            >
              <Play className="h-6 w-6" />
              <span>Iniciar Jornada</span>
            </button>
          ) : (
            <>
              {!isOnBreak ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStartBreak('coffee')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Coffee className="h-5 w-5" />
                    <span>Descanso</span>
                  </button>
                  <button
                    onClick={() => handleStartBreak('lunch')}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <Timer className="h-5 w-5" />
                    <span>Comida</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEndBreak}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-2"
                >
                  <Play className="h-6 w-6" />
                  <span>Reanudar Trabajo</span>
                </button>
              )}
              
              <button
                onClick={handleClockOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <Square className="h-6 w-6" />
                <span>Finalizar Jornada</span>
              </button>
            </>
          )}
        </div>

        {/* Today's Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
          <h3 className="font-medium text-gray-900 mb-3">Resumen de Hoy</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">7h 15m</div>
              <div className="text-xs text-gray-600">Tiempo Trabajado</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">45m</div>
              <div className="text-xs text-gray-600">Descansos</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center space-y-2">
            <Calendar className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Historial</span>
          </button>
          <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center space-y-2">
            <FileText className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Mis Partes</span>
          </button>
          <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center space-y-2">
            <Settings className="h-6 w-6 text-gray-600" />
            <span className="text-xs text-gray-600">Ajustes</span>
          </button>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <Phone className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Contacto de Emergencia</span>
          </div>
          <a 
            href="tel:+34960225469" 
            className="text-sm text-red-700 hover:text-red-900"
          >
            +34 960 22 54 69 (Oficina)
          </a>
        </div>
      </div>
    </div>
  );
};

export default WorkerMobileApp;