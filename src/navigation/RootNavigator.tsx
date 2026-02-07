import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useBudget } from '../context/useBudget';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import OnboardingScreen from '../screens/OnboardingScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, hasOnboarded, loading } = useBudget();

  if (loading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000' },
      }}
    >
      {!user ? (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{ headerShown: false }}
        />
      ) : !hasOnboarded ? (
        // We can render Onboarding directly or wrapped.
        // Since it's a single screen flow for now, direct is fine,
        // but wrapping in a nested stack is cleaner if we had more steps.
        // However, separating it completely allows avoiding "History" being accessible here.
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        // AppStack is a nested navigator, but we want it to be the root for authenticated users.
        // By rendering it as a component of a Screen, we essentially mount it.
        // NOTE: React Navigation recommends hiding headers when nesting if the child has headers (we sort of do).
        <Stack.Screen
          name="App"
          component={AppStack}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
