import win32serviceutil
import win32service
import win32event
import servicemanager
import os
import time

class DjangoService(win32serviceutil.ServiceFramework):
    _svc_name_ = "DjangoChatService2"
    _svc_display_name_ = "Django Chat Service2"
    _svc_description_ = "A service to run Django chat application."

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        self.stop_requested = False

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.stop_requested = True

    def SvcDoRun(self):
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_, ''))
        self.main()

    def main(self):
        try:
            os.chdir(r"C:\HOMEPAGE\django_chat\djangochat")  # 確保路徑正確
            servicemanager.LogInfoMsg("Changed directory to Django project.")
            time.sleep(5)  # 添加延遲
            os.system(r"C:\HOMEPAGE\django_chat\venv-djangochat\Scripts\python.exe manage.py runserver 0.0.0.0:3268")
        except Exception as e:
            servicemanager.LogErrorMsg(f"Error running server: {e}")

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(DjangoService)