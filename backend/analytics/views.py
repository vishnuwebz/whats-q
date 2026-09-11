from rest_framework import serializers, viewsets
from .models import ChannelMetric, IntentMetric, DailyMetric

class ChannelMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChannelMetric
        fields = '__all__'

class IntentMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntentMetric
        fields = '__all__'

class DailyMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMetric
        fields = '__all__'

class ChannelMetricViewSet(viewsets.ModelViewSet):
    queryset = ChannelMetric.objects.all().order_by('-total_conversations')
    serializer_class = ChannelMetricSerializer

class IntentMetricViewSet(viewsets.ModelViewSet):
    queryset = IntentMetric.objects.all().order_by('-count')
    serializer_class = IntentMetricSerializer

class DailyMetricViewSet(viewsets.ModelViewSet):
    queryset = DailyMetric.objects.all().order_by('id')
    serializer_class = DailyMetricSerializer
