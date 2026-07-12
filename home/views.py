from django.shortcuts import render
from menu.models import MenuItem, Category

def home(request):
    items = MenuItem.objects.filter(is_available=True)
    categories = Category.objects.all()

    return render(request, "home/index.html", {
        "items": items,
        "categories": categories,
    })