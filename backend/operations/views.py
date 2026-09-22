from rest_framework import serializers, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Job, Appointment, Employee, ScheduleShift, AttendanceRecord, Task, Route, InventoryItem, CustomPdfTemplate

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'

class ScheduleShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleShift
        fields = '__all__'

class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-id')
    serializer_class = JobSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by('id')
    serializer_class = AppointmentSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by('id')
    serializer_class = EmployeeSerializer

class ScheduleShiftViewSet(viewsets.ModelViewSet):
    queryset = ScheduleShift.objects.all().order_by('id')
    serializer_class = ScheduleShiftSerializer

class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all().order_by('id')
    serializer_class = AttendanceRecordSerializer

    @action(detail=False, methods=['post'], url_path='punch')
    def punch(self, request):
        employee_id = request.data.get('employee_id')
        employee_id_str = request.data.get('employee_id_str', '')
        action_type = request.data.get('action', 'punch_in')
        check_time = request.data.get('time', '')
        req_status = request.data.get('status', 'present')
        device = request.data.get('device', 'WhatsApp Geo-Punch (Android)')
        location = request.data.get('location', 'Kozhikode, Kerala')
        work_hours = request.data.get('work_hours', '')
        shift = request.data.get('shift', '9:00 AM - 6:00 PM')

        employee = None
        if employee_id:
            employee = Employee.objects.filter(id=employee_id).first()
        if not employee and employee_id_str:
            employee = Employee.objects.filter(employee_id_str=employee_id_str).first()

        emp_name = employee.name if employee else request.data.get('employee_name', 'Staff Member')
        emp_id_str = employee.employee_id_str if employee else (employee_id_str or 'EMP-001')
        emp_dept = employee.department if employee else request.data.get('department', 'AC Services')
        emp_loc = employee.location if employee else location

        record = AttendanceRecord.objects.filter(employee_id_str=emp_id_str).order_by('-id').first()

        if action_type == 'punch_out':
            if not record:
                record = AttendanceRecord.objects.create(
                    employee_id_str=emp_id_str,
                    employee_name=emp_name,
                    department=emp_dept,
                    shift=shift,
                    check_in='9:00 AM',
                    check_out=check_time or '5:00 PM',
                    work_hours=work_hours or '8h 00m',
                    status='present',
                    location=emp_loc,
                    device=device
                )
            else:
                record.check_out = check_time or '5:00 PM'
                if work_hours:
                    record.work_hours = work_hours
                record.status = 'present'
                record.device = device
                record.save()

            if employee:
                employee.status = 'active'
                employee.save()

        elif action_type == 'on_leave':
            if not record:
                record = AttendanceRecord.objects.create(
                    employee_id_str=emp_id_str,
                    employee_name=emp_name,
                    department=emp_dept,
                    shift=shift,
                    check_in='-',
                    check_out=None,
                    work_hours='0h 00m',
                    status='on_leave',
                    location=emp_loc,
                    device='Leave Portal (Approved)'
                )
            else:
                record.status = 'on_leave'
                record.check_in = '-'
                record.check_out = None
                record.work_hours = '0h 00m'
                record.device = 'Leave Portal (Approved)'
                record.save()

            if employee:
                employee.status = 'on_leave'
                employee.save()

        else:  # punch_in
            if not record:
                record = AttendanceRecord.objects.create(
                    employee_id_str=emp_id_str,
                    employee_name=emp_name,
                    department=emp_dept,
                    shift=shift,
                    check_in=check_time or '9:00 AM',
                    check_out=None,
                    work_hours=work_hours or '0h 01m',
                    status=req_status or 'present',
                    location=emp_loc,
                    device=device
                )
            else:
                record.check_in = check_time or '9:00 AM'
                record.check_out = None
                record.work_hours = work_hours or '0h 01m'
                record.status = req_status or 'present'
                record.device = device
                record.location = emp_loc
                record.save()

            if employee:
                employee.status = 'on_duty'
                employee.save()

        return Response({
            'success': True,
            'record': AttendanceRecordSerializer(record).data,
            'employee': EmployeeSerializer(employee).data if employee else None
        }, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        record = serializer.save()
        if record.employee_id_str:
            emp = Employee.objects.filter(employee_id_str=record.employee_id_str).first()
            if emp:
                if record.status == 'present':
                    emp.status = 'on_duty' if not record.check_out else 'active'
                elif record.status == 'on_leave':
                    emp.status = 'on_leave'
                emp.save()

    def perform_update(self, serializer):
        record = serializer.save()
        if record.employee_id_str:
            emp = Employee.objects.filter(employee_id_str=record.employee_id_str).first()
            if emp:
                if record.status == 'present':
                    emp.status = 'on_duty' if not record.check_out else 'active'
                elif record.status == 'on_leave':
                    emp.status = 'on_leave'
                emp.save()

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('id')
    serializer_class = TaskSerializer

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all().order_by('id')
    serializer_class = RouteSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().order_by('id')
    serializer_class = InventoryItemSerializer

class CustomPdfTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomPdfTemplate
        fields = '__all__'

class CustomPdfTemplateViewSet(viewsets.ModelViewSet):
    queryset = CustomPdfTemplate.objects.all().order_by('-updated_at')
    serializer_class = CustomPdfTemplateSerializer

    @action(detail=False, methods=['post'], url_path='save_template')
    def save_template(self, request):
        template_type = request.data.get('type') or request.data.get('template_type') or 'default'
        title = request.data.get('title') or f"Template {template_type}"
        data = request.data
        template, created = CustomPdfTemplate.objects.update_or_create(
            template_type=template_type,
            defaults={'title': title, 'data': data}
        )
        return Response({'success': True, 'template': CustomPdfTemplateSerializer(template).data})

    @action(detail=False, methods=['get'], url_path='get_template')
    def get_template(self, request):
        template_type = request.query_params.get('type', 'default')
        template = CustomPdfTemplate.objects.filter(template_type=template_type).first()
        if template:
            return Response({'success': True, 'data': template.data})
        return Response({'success': False, 'message': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
