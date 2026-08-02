from django.db.models import Count
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Application, Job
from .permissions import IsCandidate, IsRecruiter
from .serializers import ApplicationSerializer, ApplicationStatusSerializer, JobSerializer, RegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = self.get_queryset().get(pk=response.data['id'])
        token = RefreshToken.for_user(user)
        response.data.update({'access': str(token.access_token), 'refresh': str(token), 'user': UserSerializer(user).data})
        return response
    def get_queryset(self):
        from .models import User
        return User.objects.all()

class MeView(APIView):
    def get(self, request): return Response(UserSerializer(request.user).data)

class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    def get_permissions(self):
        return [permissions.AllowAny()] if self.request.method == 'GET' else [IsRecruiter()]
    def get_queryset(self):
        qs = Job.objects.select_related('recruiter').annotate(application_count=Count('applications'))
        user = self.request.user
        if user.is_authenticated and user.role == 'RECRUITER': return qs.filter(recruiter=user)
        return qs.filter(status=Job.Status.OPEN)
    def perform_create(self, serializer): serializer.save(recruiter=self.request.user)

class JobDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = JobSerializer
    def get_permissions(self):
        return [permissions.AllowAny()] if self.request.method == 'GET' else [IsRecruiter()]
    def get_queryset(self): return Job.objects.select_related('recruiter').annotate(application_count=Count('applications'))
    def perform_update(self, serializer):
        if serializer.instance.recruiter_id != self.request.user.id: raise PermissionDenied('You do not own this job.')
        serializer.save()

class CloseJobView(APIView):
    permission_classes = [IsRecruiter]
    def patch(self, request, pk):
        job = generics.get_object_or_404(Job, pk=pk, recruiter=request.user)
        job.status = Job.Status.CLOSED
        job.save(update_fields=['status', 'updated_at'])
        return Response(JobSerializer(job, context={'request': request}).data)

class ApplyView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsCandidate]
    def perform_create(self, serializer):
        job = generics.get_object_or_404(Job, pk=self.kwargs['pk'])
        if job.status != Job.Status.OPEN: raise ValidationError('This job is closed.')
        if Application.objects.filter(job=job, candidate=self.request.user).exists(): raise ValidationError('You already applied for this job.')
        serializer.save(job=job, candidate=self.request.user)

class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    def get_queryset(self):
        qs = Application.objects.select_related('job', 'candidate')
        user = self.request.user
        return qs.filter(job__recruiter=user) if user.role == 'RECRUITER' else qs.filter(candidate=user)

class ApplicationStatusView(generics.UpdateAPIView):
    serializer_class = ApplicationStatusSerializer
    permission_classes = [IsRecruiter]
    http_method_names = ['patch']
    def get_queryset(self): return Application.objects.filter(job__recruiter=self.request.user)

