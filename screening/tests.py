from django.urls import reverse
from rest_framework.test import APITestCase
from .models import Application, Job, User

class ScreeningFlowTests(APITestCase):
    def setUp(self):
        self.recruiter = User.objects.create_user('recruiter', password='password123', role='RECRUITER')
        self.candidate = User.objects.create_user('candidate', password='password123', role='CANDIDATE')
        self.job = Job.objects.create(recruiter=self.recruiter, title='Backend Engineer', description='Build APIs', location='Dhaka')
    def auth(self, user): self.client.force_authenticate(user)
    def test_candidate_can_apply_and_track(self):
        self.auth(self.candidate)
        response = self.client.post(f'/api/jobs/{self.job.id}/apply/', {'resume_url': 'https://example.com/resume.pdf'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.client.get('/api/applications/').data[0]['status'], 'APPLIED')
    def test_duplicate_application_is_rejected(self):
        Application.objects.create(job=self.job, candidate=self.candidate, resume_url='https://example.com/a')
        self.auth(self.candidate)
        self.assertEqual(self.client.post(f'/api/jobs/{self.job.id}/apply/', {'resume_url': 'https://example.com/b'}).status_code, 400)
    def test_recruiter_can_close_own_job(self):
        self.auth(self.recruiter)
        self.assertEqual(self.client.patch(f'/api/jobs/{self.job.id}/close/').status_code, 200)
        self.job.refresh_from_db(); self.assertEqual(self.job.status, 'CLOSED')
    def test_candidate_cannot_create_job(self):
        self.auth(self.candidate)
        self.assertEqual(self.client.post('/api/jobs/', {'title':'X','description':'Y','location':'Z'}).status_code, 403)

