from rest_framework import serializers
from .models import Application, Job, User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'password']
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'role']
    def get_name(self, obj):
        return obj.get_full_name() or obj.username

class JobSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(source='recruiter.get_full_name', read_only=True)
    application_count = serializers.IntegerField(read_only=True, default=0)
    has_applied = serializers.SerializerMethodField()
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'location', 'employment_type', 'status', 'recruiter_name', 'application_count', 'has_applied', 'created_at', 'updated_at']
        read_only_fields = ['status']
    def get_has_applied(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.is_authenticated and obj.applications.filter(candidate=request.user).exists())

class ApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.get_full_name', read_only=True)
    candidate_email = serializers.EmailField(source='candidate.email', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'candidate_name', 'candidate_email', 'resume_url', 'cover_letter', 'status', 'created_at', 'updated_at']
        read_only_fields = ['job', 'status']

class ApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status']
