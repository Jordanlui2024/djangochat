from django.shortcuts import render
from .forms import ForumForm, RelyForm
from .models import ForumModel, ReplyModel
# Create your views here.
def forumPage(request, forum_id):
    forum = ForumModel.objects.get(id=forum_id)
    if request.method == "POST":
       form = RelyForm(request.POST)
       if form.is_valid():   
          forum = ForumModel.objects.get(id=forum_id)
          reply = form.save(commit=False)
          reply.forum = forum
          reply.author = request.user
          reply.save()
       else:
          print(forum.error)  
    else:
       print(forum_id)
       forum.views += 1
       forum.save()
    form = RelyForm()
    replylist = ReplyModel.objects.order_by("-publication_date")
    return render(request, 'forumPage.html', {"form":form, "forum":forum, "replylist":replylist})


def forumListPage(request):
    if request.method == "POST":
        form = ForumForm(request.POST)
        if form.is_valid():
            print(request.user)
            forum = form.save(commit=False)
            forum.author = request.user
            forum.save()
        else:    
            print(forum.error)
    form = ForumForm()
    forumlist = ForumModel.objects.order_by("-publication_date")
    return render(request, "forumListPage.html", {"form": form, "forumlist": forumlist})