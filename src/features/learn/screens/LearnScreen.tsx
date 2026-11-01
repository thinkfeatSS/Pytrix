import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer, AppText, AppCard, Badge } from '../../../shared/components';
import { useTheme } from '../../../shared/theme';
import { DatabaseClient } from '../../../database/DatabaseClient';
import { Course } from '../../../shared/types/curriculum';

interface LearnScreenProps {
  navigation: any;
}

export function LearnScreen({ navigation }: LearnScreenProps) {
  const { theme } = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCurriculum() {
      try {
        const dbClient = DatabaseClient.getInstance();
        await dbClient.initialize();
        const data = await dbClient.courseRepo.getCourseOverview('course_python_basics');
        if (isMounted) {
          setCourse(data);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCurriculum();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTopicPress = (topicId: string, title: string) => {
    if (title.toLowerCase().includes('checkpoint')) {
      navigation.navigate('Checkpoint', { topicId, topicTitle: title });
    } else {
      navigation.navigate('TopicLearning', { topicId });
    }
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <AppText variant="h1">{course?.title || 'Python Syllabus'}</AppText>
        <AppText variant="bodySmall">
          Master Python step by step. Complete 3-problem checkpoints to unlock subsequent topics.
        </AppText>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <AppText variant="caption" style={styles.loadingText}>
            Loading offline curriculum...
          </AppText>
        </View>
      ) : (
        course?.modules?.map((mod) => (
          <View key={mod.id} style={styles.moduleSection}>
            <View style={styles.moduleHeader}>
              <Badge label={`MODULE ${mod.number}`} variant="python" />
              <AppText variant="h2" style={styles.moduleTitle}>{mod.title}</AppText>
              <AppText variant="bodySmall" color={theme.colors.textMuted}>{mod.description}</AppText>
            </View>

            <View style={styles.topicList}>
              {mod.topics?.map((top) => {
                const isAvailable = top.status === 'AVAILABLE' || top.status === 'COMPLETED';
                const isCompleted = top.status === 'COMPLETED';

                return (
                  <TouchableOpacity
                    key={top.id}
                    disabled={!isAvailable}
                    activeOpacity={0.7}
                    onPress={() => handleTopicPress(top.id, top.title)}
                    style={styles.topicTouchable}
                  >
                    <AppCard
                      bordered
                      elevated={isAvailable}
                      style={[
                        styles.topicCard,
                        isAvailable ? { borderColor: theme.colors.primary } : styles.topicLocked,
                      ]}
                    >
                      <View style={styles.topicRow}>
                        <View style={styles.topicInfo}>
                          <AppText variant="body" weight={isAvailable ? 'medium' : 'regular'}>
                            {top.title}
                          </AppText>
                          <AppText variant="caption" color={theme.colors.textMuted} style={styles.modeText}>
                            {top.learningObjective}
                          </AppText>
                        </View>
                        <Badge
                          label={
                            isCompleted
                              ? 'COMPLETED ✓'
                              : isAvailable
                              ? 'START'
                              : 'LOCKED 🔒'
                          }
                          variant={
                            isCompleted
                              ? 'success'
                              : isAvailable
                              ? 'python'
                              : 'neutral'
                          }
                        />
                      </View>
                    </AppCard>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: 16,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  moduleSection: {
    marginBottom: 28,
  },
  moduleHeader: {
    marginBottom: 12,
  },
  moduleTitle: {
    marginTop: 6,
    marginBottom: 4,
  },
  topicList: {
    gap: 10,
  },
  topicTouchable: {
    marginBottom: 8,
  },
  topicCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  topicLocked: {
    opacity: 0.55,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicInfo: {
    flex: 1,
    paddingRight: 12,
  },
  modeText: {
    marginTop: 4,
  },
});
