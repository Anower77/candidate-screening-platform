from django.core.management.base import BaseCommand
from screening.models import Application, Job, User

class Command(BaseCommand):
    help = 'Create deterministic demo users, jobs, and an application'
    def handle(self, *args, **kwargs):
        recruiter, _ = User.objects.get_or_create(username='recruiter_demo', defaults={'email':'recruiter@example.com','first_name':'Rina','last_name':'Rahman','role':'RECRUITER'})
        candidate, _ = User.objects.get_or_create(username='candidate_demo', defaults={'email':'candidate@example.com','first_name':'Nabil','last_name':'Ahmed','role':'CANDIDATE'})
        recruiter.set_password('DemoPass123!'); recruiter.save()
        candidate.set_password('DemoPass123!'); candidate.save()
        job, _ = Job.objects.get_or_create(recruiter=recruiter, title='Python Backend Developer', defaults={'description':'Build reliable APIs and collaborate with a product-focused engineering team.','location':'Dhaka / Hybrid','employment_type':'Full-time'})
        Application.objects.get_or_create(job=job, candidate=candidate, defaults={'resume_url':'https://example.com/resume.pdf','cover_letter':'I enjoy building clear, maintainable backend systems.'})
        self.stdout.write(self.style.SUCCESS('Demo data ready. Password for both accounts: DemoPass123!'))

