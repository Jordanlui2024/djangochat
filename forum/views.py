from django.shortcuts import render
from .forms import ForumForm, RelyForm
from .models import ForumModel, ReplyModel
from django.contrib.auth.decorators import login_required
# Create your views here.
def forumPage(request, forum_id, page=1):
    forum = ForumModel.objects.get(id=forum_id)
    if request.method == "POST":
       form = RelyForm(request.POST)
       if form.is_valid():   
          forum = ForumModel.objects.get(id=forum_id)
          reply = form.save(commit=False)
          reply.forum = forum
          reply.author = request.user
          reply.save()
          forum.replies +=1
          forum.save()
       else:
          print(forum.error)  
    else:
       print(forum_id)
       userid = forum.author.id
       if(userid != request.user.id):
          forum.views += 1
          forum.save()
    form = RelyForm()
    replylist = ReplyModel.objects.filter(forum__id=forum_id).order_by("publication_date")
    return render(request, 'forumPage.html', {"form":form, "forum":forum, "replylist":replylist, "page":page})


def forumListPage(request, page=1):
    print(page)
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
    return render(request, "forumListPage.html", {"form": form, "forumlist": forumlist, "page":page})

@login_required
def forumArticlePage(request, author_id):
    if request.method == "POST":
        delid = request.POST['forumid']
        del_rec = ForumModel.objects.get(id=delid)
        del_rec.delete()
        form = ForumForm()

    # elif request.method == "GET":
    #     forumId = request.GET['forumid']
    #     print(forumId)
    #     forumdata = ForumModel.objects.get(id=forumId)
    #     form = ForumForm(forumdata)
   
    
    form = ForumForm()
    forumlist = ForumModel.objects.filter(author__id=author_id).order_by("-publication_date")
    return render(request, "forumArticlePage.html", {"form": form, "forumlist": forumlist})