from django.shortcuts import render, redirect
from django.contrib.auth import login

from .forms import SingUpForm

# Create your views here.
def homePage(request):
    return render(request, 'core/homePage.html')    

# def loginPage(request):
#     return render(request, 'core/loginPage.html')   

def signupPage(request):
    if request.method == "POST":
        form = SingUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('roomsPage')
        else:
            print(form.errors)    
    else:
        form = SingUpForm()
            
    return render(request, 'core/signupPage.html', {"form":form})