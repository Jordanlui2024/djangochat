import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import os
import sys

class DjangoService(win32serviceutil.ServiceFramework):
    _svc_name_ = "DjangoService"
    _svc_display_name_ = "My Django Service"
    _svc_description_ = "This is a Django service."

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        socket.setdefaulttimeout(60)
        self.is_running = False

    def SvcDoRun(self):
    servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                          servicemanager.PYS_SERVICE_STARTED,
                          (self._svc_name_, ''))
    self.is_running = True
    os.chdir("C:\HOMEPAGE\django_chat\djangochat")
    sys.path.append("C:\HOMEPAGE\django_chat\djangochat")
    # 使用虚拟环境中的Python解释器路径
    python_path = "C:\HOMEPAGE\django_chat\venv-djangochat\Scripts\python.exe"
    execute_from_command_line([python_path, "manage.py", "runserver", "0.0.0.0:32668"])

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.is_running = False