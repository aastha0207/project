from django.shortcuts import render
from .models import MenuItem

def menu_list(request):
    menus = MenuItem.objects.filter(is_available=True)
    return render(request, "menu/menu.html", {"menus": menus})