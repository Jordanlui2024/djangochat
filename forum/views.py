from django.shortcuts import render

# Create your views here.
def forumPage(request):
    return render(request, 'forumPage.html')