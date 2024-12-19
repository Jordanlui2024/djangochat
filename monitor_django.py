import psutil
import time
import os
import subprocess
import signal
import logging
from datetime import datetime

# 配置日誌
logging.basicConfig(
    filename='django_monitor.log',
    level=logging.INFO,
    format='%(asctime)s - %(message)s'
)

# 配置參數
CPU_THRESHOLD = 22.0  # CPU 使用率閾值
CHECK_INTERVAL = 30   # 檢查間隔（秒）
DJANGO_SCRIPT = "manage.py"  # Django 啟動腳本
PYTHON_PATH = "python"       # Python 解釋器路徑

def get_django_process():
    """獲取 Django 進程"""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if proc.info['name'] == 'python.exe' and DJANGO_SCRIPT in ' '.join(proc.info['cmdline'] or []):
                return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return None

def restart_django():
    """重啟 Django 進程"""
    django_proc = get_django_process()
    if django_proc:
        # 記錄關閉前的 PID
        old_pid = django_proc.pid
        logging.info(f"正在關閉 Django 進程 (PID: {old_pid})")
        
        try:
            # 嘗試���雅關閉
            django_proc.terminate()
            django_proc.wait(timeout=10)
        except psutil.TimeoutExpired:
            # 如果超時，強制關閉
            django_proc.kill()
        
        logging.info(f"成功關閉舊進程 (PID: {old_pid})")

    # 啟動新的 Django 進程
    try:
        new_process = subprocess.Popen(
            [PYTHON_PATH, DJANGO_SCRIPT, "runserver"],
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        logging.info(f"已啟動新的 Django 進程 (PID: {new_process.pid})")
        return True
    except Exception as e:
        logging.error(f"啟動新進程時出錯: {str(e)}")
        return False

def main():
    logging.info("監控程序已啟動")
    
    while True:
        django_proc = get_django_process()
        
        if django_proc:
            try:
                cpu_percent = django_proc.cpu_percent(interval=1)
                logging.info(f"當前 CPU 使用率: {cpu_percent}%")
                
                if cpu_percent >= CPU_THRESHOLD:
                    logging.warning(f"CPU 使用率 ({cpu_percent}%) 超過閾值 ({CPU_THRESHOLD}%)")
                    if restart_django():
                        logging.info("Django 進程已成功重啟")
                    else:
                        logging.error("重啟 Django 進程失敗")
            except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                logging.error(f"監控進程時出錯: {str(e)}")
        else:
            logging.warning("未找到 Django 進程，嘗試啟動新進程")
            restart_django()
        
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logging.info("監控程序已停止") 