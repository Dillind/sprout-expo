import AppText from '@/src/components/core/AppText';
import { Leaf } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { Task } from '@/src/utils/tasks';
import TaskCard from './TaskCard';

type Props = {
    tasks: Task[];
    onCompleteTask: (task: Task) => void;
    completingTaskId?: string;
    title?: string;
};

export default function TaskList({ tasks, onCompleteTask, completingTaskId, title }: Props) {
    return (
        <View>
            {title && (
                <AppText size="sm" font="bold" className="mb-3">{title}</AppText>
            )}
            {tasks.length === 0 ? (
                <View className="items-center py-8">
                    <Leaf size={28} color="#9CD374" />
                    <AppText size="sm" color="gray" className="mt-2">All caught up!</AppText>
                </View>
            ) : (
                tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={onCompleteTask}
                        isCompleting={completingTaskId === task.id}
                    />
                ))
            )}
        </View>
    );
}
