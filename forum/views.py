from django.shortcuts import render

# Create your views here.
def forumPage(request):
    return render(request, 'forumPage.html')


def forumListPage(request):
    topics = ["All", "Python", "Php", "Java", "Kotlin", "Golang", "Javascript", "Django", "Docker", "Typescript"]
    return render(request, 'forumListPage.html', {"topics":topics, "range": range(1, 10) })