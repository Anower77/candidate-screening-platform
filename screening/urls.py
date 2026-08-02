from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import *
urlpatterns = [
    path('auth/register/', RegisterView.as_view()), path('auth/login/', TokenObtainPairView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()), path('auth/me/', MeView.as_view()),
    path('jobs/', JobListCreateView.as_view()), path('jobs/<int:pk>/', JobDetailView.as_view()),
    path('jobs/<int:pk>/close/', CloseJobView.as_view()), path('jobs/<int:pk>/apply/', ApplyView.as_view()),
    path('applications/', ApplicationListView.as_view()), path('applications/<int:pk>/status/', ApplicationStatusView.as_view()),
]

