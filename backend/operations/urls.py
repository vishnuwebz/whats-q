from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    JobViewSet, AppointmentViewSet, EmployeeViewSet,
    ScheduleShiftViewSet, AttendanceRecordViewSet,
    TaskViewSet, RouteViewSet, InventoryItemViewSet
)

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'schedule-shifts', ScheduleShiftViewSet)
router.register(r'attendance', AttendanceRecordViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'routes', RouteViewSet)
router.register(r'inventory', InventoryItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
