const USER_STORAGE_KEY = 'healthyTogetherUsers';
const CURRENT_USER_KEY = 'healthyTogetherCurrentUser';
const appConfig = window.HABITSPRING_CONFIG || window.HEALTHYTOGETHER_CONFIG || { supabase: { enabled: false } };
const supabaseEnabled = Boolean(
  appConfig.supabase &&
  appConfig.supabase.enabled &&
  appConfig.supabase.url &&
  appConfig.supabase.url !== 'https://your-project.supabase.co' &&
  window.supabase
);
const supabaseClient = supabaseEnabled
  ? window.supabase.createClient(appConfig.supabase.url, appConfig.supabase.anonKey, {
      auth: {
        persistSession: true,
        storageKey: appConfig.supabase.storageKey || 'habitSpringAuthSession'
      }
    })
  : null;

const demoState = {
  goals: {
    calories: 2000,
    water: 2500,
    movement: 45,
    sleep: 8,
  },
  meals: [
    { id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-1', type: 'Breakfast', name: 'Oat & berry bowl', calories: 420, protein: 18 },
    { id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-2', type: 'Lunch', name: 'Chicken quinoa salad', calories: 560, protein: 35 },
  ],
  activities: [
    { id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-3', type: 'Walk', minutes: 26 },
    { id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-4', type: 'Yoga', minutes: 20 },
  ],
  water: 1800,
  metrics: {
    weight: 68.4,
    steps: 8400,
    sleep: 7.4,
    mood: 4,
    bloodPressure: '118/76',
  },
  habits: [
    { id: 'habit-1', label: 'Fruit & veg', done: true },
    { id: 'habit-2', label: 'Stretch break', done: false },
    { id: 'habit-3', label: 'Mindful pause', done: true },
    { id: 'habit-4', label: 'Screen-free hour', done: false },
  ],
};

function createEmptyState() {
  return {
    goals: {
      calories: 2000,
      water: 2500,
      movement: 45,
      sleep: 8,
    },
    meals: [],
    activities: [],
    water: 0,
    metrics: {
      weight: 0,
      steps: 0,
      sleep: 0,
      mood: 3,
      bloodPressure: '',
    },
    habits: [
      { id: 'habit-1', label: 'Fruit & veg', done: false },
      { id: 'habit-2', label: 'Stretch break', done: false },
      { id: 'habit-3', label: 'Mindful pause', done: false },
      { id: 'habit-4', label: 'Screen-free hour', done: false },
    ],
  };
}

function normalizeProfileState(rawState) {
  const emptyState = createEmptyState();

  if (!rawState || typeof rawState !== 'object') {
    return emptyState;
  }

  const isSeededDemoState =
    rawState.water === demoState.water &&
    rawState.metrics?.weight === demoState.metrics.weight &&
    rawState.metrics?.steps === demoState.metrics.steps &&
    rawState.metrics?.sleep === demoState.metrics.sleep &&
    rawState.metrics?.bloodPressure === demoState.metrics.bloodPressure &&
    Array.isArray(rawState.meals) &&
    rawState.meals.some((meal) => meal.name === 'Oat & berry bowl') &&
    rawState.meals.some((meal) => meal.name === 'Chicken quinoa salad') &&
    Array.isArray(rawState.activities) &&
    rawState.activities.some((activity) => activity.type === 'Walk' && activity.minutes === 26) &&
    rawState.activities.some((activity) => activity.type === 'Yoga' && activity.minutes === 20);

  if (isSeededDemoState) {
    return emptyState;
  }

  return {
    goals: {
      ...emptyState.goals,
      ...(rawState.goals || {})
    },
    meals: Array.isArray(rawState.meals) ? rawState.meals : [],
    activities: Array.isArray(rawState.activities) ? rawState.activities : [],
    water: Number(rawState.water) || 0,
    metrics: {
      ...emptyState.metrics,
      ...(rawState.metrics || {})
    },
    habits: Array.isArray(rawState.habits) && rawState.habits.length ? rawState.habits : emptyState.habits,
  };
}

const initialState = createEmptyState();
let state = structuredClone(initialState);
let currentUser = null;

const elements = {
  authScreen: document.getElementById('authScreen'),
  appShell: document.getElementById('appShell'),
  authForm: document.getElementById('authForm'),
  authSubmitBtn: document.getElementById('authSubmitBtn'),
  authMessage: document.getElementById('authMessage'),
  authNameLabel: document.getElementById('authNameLabel'),
  authName: document.getElementById('authName'),
  authEmail: document.getElementById('authEmail'),
  authPassword: document.getElementById('authPassword'),
  authModeButtons: document.querySelectorAll('.auth-tab'),
  welcomeUser: document.getElementById('welcomeUser'),
  logoutBtn: document.getElementById('logoutBtn'),
  mealForm: document.getElementById('mealForm'),
  mealType: document.getElementById('mealType'),
  mealCalories: document.getElementById('mealCalories'),
  mealName: document.getElementById('mealName'),
  mealProtein: document.getElementById('mealProtein'),
  mealList: document.getElementById('mealList'),
  exerciseForm: document.getElementById('exerciseForm'),
  exerciseType: document.getElementById('exerciseType'),
  exerciseName: document.getElementById('exerciseName'),
  exerciseMinutes: document.getElementById('exerciseMinutes'),
  exerciseCalories: document.getElementById('exerciseCalories'),
  exerciseList: document.getElementById('exerciseList'),
  activityForm: document.getElementById('activityForm'),
  activityType: document.getElementById('activityType'),
  activityMinutes: document.getElementById('activityMinutes'),
  activityList: document.getElementById('activityList'),
  waterFill: document.getElementById('waterFill'),
  waterAmount: document.getElementById('waterAmount'),
  waterGoalLabel: document.getElementById('waterGoalLabel'),
  nutritionMetric: document.getElementById('nutritionMetric'),
  nutritionSub: document.getElementById('nutritionSub'),
  nutritionBar: document.getElementById('nutritionBar'),
  hydrationMetric: document.getElementById('hydrationMetric'),
  hydrationSub: document.getElementById('hydrationSub'),
  hydrationBar: document.getElementById('hydrationBar'),
  movementMetric: document.getElementById('movementMetric'),
  movementSub: document.getElementById('movementSub'),
  movementBar: document.getElementById('movementBar'),
  recoveryMetric: document.getElementById('recoveryMetric'),
  recoverySub: document.getElementById('recoverySub'),
  recoveryBar: document.getElementById('recoveryBar'),
  wellnessScore: document.getElementById('wellnessScore'),
  overviewMeals: document.getElementById('overviewMeals'),
  overviewMealsSub: document.getElementById('overviewMealsSub'),
  overviewCalories: document.getElementById('overviewCalories'),
  overviewCaloriesSub: document.getElementById('overviewCaloriesSub'),
  overviewMovement: document.getElementById('overviewMovement'),
  overviewMovementSub: document.getElementById('overviewMovementSub'),
  overviewHydration: document.getElementById('overviewHydration'),
  overviewHydrationSub: document.getElementById('overviewHydrationSub'),
  overviewScore: document.getElementById('overviewScore'),
  overviewScoreSub: document.getElementById('overviewScoreSub'),
  overviewHabits: document.getElementById('overviewHabits'),
  overviewHabitsSub: document.getElementById('overviewHabitsSub'),
  insightList: document.getElementById('insightList'),
  communityMetrics: document.getElementById('communityMetrics'),
  habitList: document.getElementById('habitList'),
  quickWaterBtn: document.getElementById('quickWaterBtn'),
  metricsForm: document.getElementById('metricsForm'),
  weightInput: document.getElementById('weightInput'),
  stepsInput: document.getElementById('stepsInput'),
  sleepInput: document.getElementById('sleepInput'),
  moodInput: document.getElementById('moodInput'),
  bpInput: document.getElementById('bpInput'),
  dashboardToggle: document.getElementById('dashboardToggle'),
  dashboardDrawer: document.getElementById('dashboardDrawer'),
  dashboardBackdrop: document.getElementById('dashboardBackdrop'),
  closeDashboardDrawer: document.getElementById('closeDashboardDrawer'),
  goalForm: document.getElementById('goalForm'),
  goalCalories: document.getElementById('goalCalories'),
  goalWater: document.getElementById('goalWater'),
  goalMovement: document.getElementById('goalMovement'),
  goalSleep: document.getElementById('goalSleep'),
  drawerScore: document.getElementById('drawerScore'),
  drawerCalories: document.getElementById('drawerCalories'),
  drawerWater: document.getElementById('drawerWater'),
  drawerSteps: document.getElementById('drawerSteps'),
  drawerSummaryList: document.getElementById('drawerSummaryList'),
};

let authMode = 'login';

function getUsers() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Unable to read users:', error);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUserId() {
  return localStorage.getItem(CURRENT_USER_KEY) || '';
}

function setCurrentUserId(userId) {
  if (userId) {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

function hydrateStateFromUser(user) {
  state = user && user.data ? structuredClone(normalizeProfileState(user.data)) : structuredClone(createEmptyState());
}

async function loadStateFromSupabaseUser(userId) {
  if (!supabaseClient || !supabaseEnabled || !userId) {
    return structuredClone(createEmptyState());
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('health_data')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Could not load profile from Supabase:', error.message);
    return structuredClone(createEmptyState());
  }

  return data && data.health_data ? structuredClone(normalizeProfileState(data.health_data)) : structuredClone(createEmptyState());
}

async function saveState() {
  if (!currentUser) return;

  const payload = structuredClone(state);

  if (supabaseEnabled && supabaseClient && currentUser.id) {
    const { error } = await supabaseClient
      .from('profiles')
      .upsert(
        {
          id: currentUser.id,
          full_name: currentUser.name,
          email: currentUser.email,
          health_data: payload,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Supabase save failed:', error.message);
    }
    return;
  }

  currentUser.data = payload;
  const users = getUsers();
  const index = users.findIndex((user) => user.id === currentUser.id);
  if (index >= 0) {
    users[index] = currentUser;
    saveUsers(users);
  }
}

function showAuthScreen(message = '') {
  elements.authScreen.classList.remove('hidden');
  elements.appShell.classList.add('hidden');
  if (message) {
    elements.authMessage.textContent = message;
  }
}

function showAppScreen() {
  elements.authScreen.classList.add('hidden');
  elements.appShell.classList.remove('hidden');
  elements.welcomeUser.textContent = currentUser ? `Welcome, ${currentUser.name.split(' ')[0]}!` : '';
}

function updateAuthView() {
  const isSignup = authMode === 'signup';
  elements.authNameLabel.classList.toggle('hidden', !isSignup);
  elements.authSubmitBtn.textContent = isSignup ? 'Create account' : 'Log in';

  elements.authModeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.authMode === authMode);
  });
}

function setAuthMessage(message, isError = false) {
  elements.authMessage.textContent = message;
  elements.authMessage.style.color = isError ? '#b91c1c' : '#59728b';
}

function handleAuthModeChange(event) {
  const button = (event.currentTarget && event.currentTarget.matches('.auth-tab'))
    ? event.currentTarget
    : event.target.closest('.auth-tab');

  if (!button) return;

  authMode = button.dataset.authMode;
  updateAuthView();
  setAuthMessage('');
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = elements.authEmail.value.trim().toLowerCase();
  const password = elements.authPassword.value.trim();
  const name = elements.authName.value.trim();

  if (!email || !password) {
    setAuthMessage('Please enter both email and password.', true);
    return;
  }

  if (supabaseEnabled && supabaseClient) {
    try {
      if (authMode === 'signup') {
        if (!name) {
          setAuthMessage('Please add your full name to create an account.', true);
          return;
        }

        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });

        if (error) {
          setAuthMessage(error.message, true);
          return;
        }

        if (data?.user) {
          const profileName = data.user.user_metadata?.full_name || name;
          currentUser = {
            id: data.user.id,
            name: profileName,
            email: data.user.email,
            data: createEmptyState()
          };

          await supabaseClient.from('profiles').upsert(
            {
              id: data.user.id,
              full_name: profileName,
              email: data.user.email,
              health_data: currentUser.data,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
          );

          state = createEmptyState();
          setCurrentUserId(data.user.id);
          showAppScreen();
          renderAll();
          return;
        }

        setAuthMessage('Account created. Please check your email if confirmation is required.', false);
        return;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthMessage(error.message, true);
        return;
      }

      const user = data?.user;
      if (!user) {
        setAuthMessage('Unable to sign in. Please try again.', true);
        return;
      }

      currentUser = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        data: createEmptyState()
      };

      state = await loadStateFromSupabaseUser(user.id);
      currentUser.data = structuredClone(state);
      setCurrentUserId(user.id);
      showAppScreen();
      renderAll();
      return;
    } catch (error) {
      console.error(error);
      setAuthMessage('Could not connect to the database. Please try again later.', true);
      return;
    }
  }

  const users = getUsers();

  if (authMode === 'signup') {
    if (!name) {
      setAuthMessage('Please add your full name to create an account.', true);
      return;
    }

    const existing = users.find((user) => user.email.toLowerCase() === email);
    if (existing) {
      setAuthMessage('An account with this email already exists. Please log in instead.', true);
      return;
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name,
      email,
      password,
      data: createEmptyState(),
    };

    users.push(newUser);
    saveUsers(users);
    currentUser = newUser;
    setCurrentUserId(newUser.id);
    hydrateStateFromUser(currentUser);
    showAppScreen();
    renderAll();
    return;
  }

  const existingUser = users.find(
    (user) => user.email.toLowerCase() === email && user.password === password
  );

  if (!existingUser) {
    setAuthMessage('We could not find a matching account. Check your email and password.', true);
    return;
  }

  currentUser = existingUser;
  setCurrentUserId(existingUser.id);
  hydrateStateFromUser(existingUser);
  showAppScreen();
  renderAll();
}

async function handleLogout() {
  if (supabaseEnabled && supabaseClient) {
    await supabaseClient.auth.signOut().catch((error) => console.warn('Logout failed:', error));
  }

  currentUser = null;
  setCurrentUserId('');
  state = createEmptyState();
  elements.authForm.reset();
  setAuthMessage('You have been logged out.');
  showAuthScreen('You have been logged out.');
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function calculateTotals() {
  const calories = state.meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const protein = state.meals.reduce((sum, meal) => sum + Number(meal.protein || 0), 0);
  const movementMinutes = state.activities.reduce((sum, activity) => sum + Number(activity.minutes || 0), 0);
  const waterPercent = Math.min((state.water / state.goals.water) * 100, 100);
  const caloriesPercent = Math.min((calories / state.goals.calories) * 100, 100);
  const movementPercent = Math.min((movementMinutes / state.goals.movement) * 100, 100);
  const sleepPercent = Math.min((state.metrics.sleep / state.goals.sleep) * 100, 100);
  const wellnessScore = Math.round((caloriesPercent * 0.3) + (waterPercent * 0.25) + (movementPercent * 0.25) + (sleepPercent * 0.2));

  return { calories, protein, movementMinutes, waterPercent, caloriesPercent, movementPercent, sleepPercent, wellnessScore };
}

function renderMeals() {
  if (!state.meals.length) {
    elements.mealList.innerHTML = '<div class="log-item"><div><strong>No meals yet</strong><small>Add your first meal to start tracking.</small></div></div>';
    return;
  }

  elements.mealList.innerHTML = state.meals
    .slice()
    .reverse()
    .map(
      (meal) => `
        <div class="log-item">
          <div>
            <strong>${meal.type} · ${meal.name}</strong>
            <small>${meal.calories} kcal · ${meal.protein}g protein</small>
          </div>
          <button class="ghost-btn" type="button" data-delete-meal="${meal.id}" aria-label="Remove meal ${meal.name}">Remove</button>
        </div>
      `
    )
    .join('');
}

function renderActivities() {
  const standardActivities = (state.activities || []).filter((activity) => activity.category !== 'exercise');

  if (!standardActivities.length) {
    elements.activityList.innerHTML = '<div class="log-item"><div><strong>No activity logged</strong><small>Add movement for today.</small></div></div>';
    return;
  }

  elements.activityList.innerHTML = standardActivities
    .slice()
    .reverse()
    .map(
      (activity) => `
        <div class="log-item">
          <div>
            <strong>${activity.type}</strong>
            <small>${activity.minutes} minutes</small>
          </div>
          <button class="ghost-btn" type="button" data-delete-activity="${activity.id}" aria-label="Remove activity ${activity.type}">Remove</button>
        </div>
      `
    )
    .join('');
}

function renderExercises() {
  const exerciseEntries = (state.activities || []).filter((activity) => activity.category === 'exercise');

  if (!exerciseEntries.length) {
    elements.exerciseList.innerHTML = '<div class="log-item"><div><strong>No exercises logged</strong><small>Track your workout routine here.</small></div></div>';
    return;
  }

  elements.exerciseList.innerHTML = exerciseEntries
    .slice()
    .reverse()
    .map(
      (exercise) => `
        <div class="log-item">
          <div>
            <strong>${exercise.type}</strong>
            <small>${exercise.minutes} minutes · ${exercise.calories || 0} kcal</small>
          </div>
          <button class="ghost-btn" type="button" data-delete-activity="${exercise.id}" aria-label="Remove exercise ${exercise.type}">Remove</button>
        </div>
      `
    )
    .join('');
}

function renderHabits() {
  elements.habitList.innerHTML = state.habits
    .map(
      (habit) => `
        <div class="habit-item ${habit.done ? 'done' : ''}">
          <div>
            <strong>${habit.label}</strong>
            <small>${habit.done ? 'Completed today' : 'Pending'}</small>
          </div>
          <button class="habit-toggle" type="button" data-habit-toggle="${habit.id}" aria-label="Toggle habit ${habit.label}">
            ${habit.done ? '✓' : '+'}
          </button>
        </div>
      `
    )
    .join('');
}

function renderWater() {
  const percent = Math.min((state.water / state.goals.water) * 100, 100);
  elements.waterFill.style.height = `${percent}%`;
  elements.waterAmount.textContent = `${(state.water / 1000).toFixed(1)} L`;
  elements.waterAmount.setAttribute('aria-label', `${state.water} milliliters of water`);
  if (elements.waterGoalLabel) {
    elements.waterGoalLabel.textContent = `of ${(state.goals.water / 1000).toFixed(1)} L goal`;
  }
}

function syncGoalInputs() {
  if (!elements.goalCalories || !elements.goalWater || !elements.goalMovement || !elements.goalSleep) {
    return;
  }

  elements.goalCalories.value = String(state.goals.calories || 2000);
  elements.goalWater.value = String(state.goals.water || 2500);
  elements.goalMovement.value = String(state.goals.movement || 45);
  elements.goalSleep.value = String(state.goals.sleep || 8);
}

function syncMetricInputs() {
  if (!elements.weightInput || !elements.stepsInput || !elements.sleepInput || !elements.moodInput || !elements.bpInput) {
    return;
  }

  elements.weightInput.value = state.metrics.weight ? String(state.metrics.weight) : '';
  elements.stepsInput.value = state.metrics.steps ? String(state.metrics.steps) : '';
  elements.sleepInput.value = state.metrics.sleep ? String(state.metrics.sleep) : '';
  elements.moodInput.value = String(state.metrics.mood || 3);
  elements.bpInput.value = state.metrics.bloodPressure || '';
}

function updateRingProgress(elementId, percent, color = '#16a34a') {
  const ring = document.getElementById(elementId);
  if (!ring) return;
  const safePercent = Math.max(0, Math.min(100, percent));
  ring.style.background = `conic-gradient(${color} 0 ${safePercent}%, #e7f2ea ${safePercent}% 100%)`;
}

function renderOverviewSummary() {
  const totals = calculateTotals();
  const completedHabits = state.habits.filter((habit) => habit.done).length;
  const hydrationPercent = Math.min((state.water / state.goals.water) * 100, 100);
  const mealCalories = totals.calories;
  const protein = totals.protein;
  const carbs = Math.max(0, Math.round((mealCalories * 0.5) / 4));
  const fat = Math.max(0, Math.round((mealCalories * 0.3) / 9));
  const fiber = Math.max(0, Math.round((carbs * 0.2) + state.meals.length * 2));
  const exerciseMinutes = (state.activities || []).filter((activity) => activity.category === 'exercise').reduce((sum, activity) => sum + Number(activity.minutes || 0), 0);
  const steps = Number(state.metrics.steps || 0);
  const sleep = Number(state.metrics.sleep || 0);
  const weight = Number(state.metrics.weight || 0);

  const caloriesGoalPercent = Math.min((mealCalories / state.goals.calories) * 100, 100);
  const proteinGoalPercent = Math.min((protein / 90) * 100, 100);
  const carbsGoalPercent = Math.min((carbs / 220) * 100, 100);
  const fatGoalPercent = Math.min((fat / 70) * 100, 100);
  const fiberGoalPercent = Math.min((fiber / 30) * 100, 100);
  const waterGoalPercent = Math.min((state.water / state.goals.water) * 100, 100);
  const exerciseGoalPercent = Math.min((exerciseMinutes / state.goals.movement) * 100, 100);
  const stepsGoalPercent = Math.min((steps / 10000) * 100, 100);
  const sleepGoalPercent = Math.min((sleep / state.goals.sleep) * 100, 100);
  const weightGoalPercent = weight ? 100 : 0;
  const overallGoalPercent = Math.round((caloriesGoalPercent + waterGoalPercent + exerciseGoalPercent + sleepGoalPercent) / 4);

  const dashboardMap = [
    ['healthCaloriesVal', `${formatNumber(mealCalories)} kcal`],
    ['healthCaloriesPct', `${Math.round(caloriesGoalPercent)}%`],
    ['healthCaloriesMeta', `${formatNumber(mealCalories)} / ${formatNumber(state.goals.calories)} kcal`],
    ['healthProteinVal', `${formatNumber(protein)}g`],
    ['healthProteinPct', `${Math.round(proteinGoalPercent)}%`],
    ['healthProteinMeta', `${formatNumber(protein)} / 90g`],
    ['healthCarbsVal', `${formatNumber(carbs)}g`],
    ['healthCarbsPct', `${Math.round(carbsGoalPercent)}%`],
    ['healthCarbsMeta', `${formatNumber(carbs)} / 220g`],
    ['healthFatVal', `${formatNumber(fat)}g`],
    ['healthFatPct', `${Math.round(fatGoalPercent)}%`],
    ['healthFatMeta', `${formatNumber(fat)} / 70g`],
    ['healthFiberVal', `${formatNumber(fiber)}g`],
    ['healthFiberPct', `${Math.round(fiberGoalPercent)}%`],
    ['healthFiberMeta', `${formatNumber(fiber)} / 30g`],
    ['healthWaterVal', `${(state.water / 1000).toFixed(1)} L`],
    ['healthWaterPct', `${Math.round(waterGoalPercent)}%`],
    ['healthWaterMeta', `${(state.water / 1000).toFixed(1)} / ${(state.goals.water / 1000).toFixed(1)} L`],
    ['healthExerciseVal', `${formatNumber(exerciseMinutes)} min`],
    ['healthExercisePct', `${Math.round(exerciseGoalPercent)}%`],
    ['healthExerciseMeta', `${formatNumber(exerciseMinutes)} / ${state.goals.movement} min`],
    ['healthStepsVal', `${formatNumber(steps)}`],
    ['healthStepsPct', `${Math.round(stepsGoalPercent)}%`],
    ['healthStepsMeta', `${formatNumber(steps)} / 10,000`],
    ['healthSleepVal', `${sleep ? sleep.toFixed(1) : '0.0'} hrs`],
    ['healthSleepPct', `${Math.round(sleepGoalPercent)}%`],
    ['healthSleepMeta', `${sleep ? sleep.toFixed(1) : '0.0'} / ${state.goals.sleep} hrs`],
    ['healthWeightVal', `${weight ? weight.toFixed(1) : '0.0'} kg`],
    ['healthWeightPct', weight ? '100%' : '0%'],
    ['healthWeightMeta', weight ? 'Current' : 'Not set'],
    ['healthGoalVal', `${overallGoalPercent}%`],
  ];

  dashboardMap.forEach(([id, value]) => {
    const target = document.getElementById(id);
    if (target) target.textContent = value;
  });

  updateRingProgress('ringCalories', caloriesGoalPercent);
  updateRingProgress('ringProtein', proteinGoalPercent); 
  updateRingProgress('ringCarbs', carbsGoalPercent);
  updateRingProgress('ringFat', fatGoalPercent);
  updateRingProgress('ringFiber', fiberGoalPercent);
  updateRingProgress('ringWater', waterGoalPercent, '#2f80ed');
  updateRingProgress('ringExercise', exerciseGoalPercent, '#36c66d');
  updateRingProgress('ringSteps', stepsGoalPercent, '#8b5cf6');
  updateRingProgress('ringSleep', sleepGoalPercent, '#f59e0b');
  updateRingProgress('ringWeight', weightGoalPercent, '#ef4444');

  document.getElementById('goalBarCalories')?.style.setProperty('width', `${Math.min(caloriesGoalPercent, 100)}%`);
  document.getElementById('goalBarWater')?.style.setProperty('width', `${Math.min(waterGoalPercent, 100)}%`);
  document.getElementById('goalBarMovement')?.style.setProperty('width', `${Math.min(exerciseGoalPercent, 100)}%`);
  document.getElementById('goalBarSleep')?.style.setProperty('width', `${Math.min(sleepGoalPercent, 100)}%`);

  syncGoalInputs();
  elements.overviewMeals.textContent = String(state.meals.length);
  elements.overviewMealsSub.textContent = state.meals.length ? 'Meals tracked this session' : 'No meals yet';

  elements.overviewCalories.textContent = `${formatNumber(totals.calories)} kcal`;
  elements.overviewCaloriesSub.textContent = `${formatNumber(totals.protein)}g protein logged`;

  elements.overviewMovement.textContent = `${formatNumber(totals.movementMinutes)} min`;
  elements.overviewMovementSub.textContent = `${Math.round(Math.min((totals.movementMinutes / state.goals.movement) * 100, 100))}% of movement goal`;

  elements.overviewHydration.textContent = `${(state.water / 1000).toFixed(1)} L`;
  elements.overviewHydrationSub.textContent = `${Math.round(hydrationPercent)}% of target`;

  elements.overviewScore.textContent = String(Math.min(100, totals.wellnessScore));
  elements.overviewScoreSub.textContent = `${Math.round((completedHabits / state.habits.length) * 100) || 0}% habits complete`;

  elements.overviewHabits.textContent = `${completedHabits} / ${state.habits.length}`;
  elements.overviewHabitsSub.textContent = completedHabits === state.habits.length ? 'Excellent consistency' : 'Completed today';

  if (elements.drawerScore) {
    elements.drawerScore.textContent = String(Math.min(100, totals.wellnessScore));
  }
  if (elements.drawerCalories) {
    elements.drawerCalories.textContent = `${formatNumber(totals.calories)}`;
  }
  if (elements.drawerWater) {
    elements.drawerWater.textContent = `${(state.water / 1000).toFixed(1)} L`;
  }
  if (elements.drawerSteps) {
    elements.drawerSteps.textContent = `${formatNumber(state.metrics.steps || 0)}`;
  }

  if (elements.drawerSummaryList) {
    const summaryItems = [
      { label: 'Meals', value: `${state.meals.length}` },
      { label: 'Hydration', value: `${Math.round(hydrationPercent)}%` },
      { label: 'Movement', value: `${formatNumber(totals.movementMinutes)} min` },
      { label: 'Habits', value: `${completedHabits}/${state.habits.length}` },
    ];

    elements.drawerSummaryList.innerHTML = summaryItems
      .map((item) => `<li><span>${item.label}</span><strong>${item.value}</strong></li>`)
      .join('');
  }
}

function renderInsights() {
  const totals = calculateTotals();
  const moveGoal = Math.min((totals.movementMinutes / state.goals.movement) * 100, 100);
  const waterGoal = Math.min((state.water / state.goals.water) * 100, 100);

  const insights = [
    totals.protein >= 75 ? 'Protein is on track and supports stronger recovery.' : 'Add a protein-rich item to help your energy and muscle recovery.',
    waterGoal >= 75 ? 'Hydration is healthy today. Keep sipping to stay in the best range.' : 'Your water intake is a little low; a glass of water now could help.',
    moveGoal >= 75 ? 'Movement is strong today — this habit supports heart health and mood.' : 'A short walk would bring your activity closer to your target.',
    state.metrics.sleep >= state.goals.sleep ? 'Sleep quality is supporting your wellness goals.' : 'A slightly earlier bedtime tonight could improve recovery.',
  ];

  elements.insightList.innerHTML = insights.map((point) => `<li>${point}</li>`).join('');

  const communityInsights = [
    { label: 'Local hydration goal', value: '2.1 L avg' },
    { label: 'Active members', value: '88%' },
    { label: 'Healthy meal streak', value: '6 days' },
    { label: 'Wellness score', value: `${Math.min(92, totals.wellnessScore + 10)} / 100` },
  ];

  elements.communityMetrics.innerHTML = communityInsights
    .map(
      (item) => `
        <div class="community-metric">
          <div>
            <strong>${item.label}</strong>
            <small>Community data</small>
          </div>
          <span class="community-value">${item.value}</span>
        </div>
      `
    )
    .join('');

  const proteinProgress = Math.min((totals.protein / 90) * 100, 100);
  elements.nutritionMetric.textContent = `${formatNumber(totals.calories)} kcal`;
  elements.nutritionSub.textContent = `Goal: ${formatNumber(state.goals.calories)} kcal · ${Math.round(proteinProgress)}% protein target`;
  elements.nutritionBar.style.width = `${Math.min((totals.calories / state.goals.calories) * 100, 100)}%`;

  const movementProgress = Math.min((totals.movementMinutes / state.goals.movement) * 100, 100);
  elements.movementMetric.textContent = `${formatNumber(totals.movementMinutes)} min`;
  elements.movementSub.textContent = `Goal: ${state.goals.movement} min · ${Math.round(movementProgress)}%`;
  elements.movementBar.style.width = `${movementProgress}%`;

  const sleepProgress = Math.min((state.metrics.sleep / state.goals.sleep) * 100, 100);
  elements.recoveryMetric.textContent = `${state.metrics.sleep.toFixed(1)} hrs`;
  elements.recoverySub.textContent = `Sleep target: ${state.goals.sleep} hrs · ${Math.round(sleepProgress)}%`;
  elements.recoveryBar.style.width = `${sleepProgress}%`;

  const hydrationProgress = Math.min((state.water / state.goals.water) * 100, 100);
  elements.hydrationMetric.textContent = `${(state.water / 1000).toFixed(1)} L`;
  elements.hydrationSub.textContent = `Goal: ${(state.goals.water / 1000).toFixed(1)} L · ${Math.round(hydrationProgress)}%`;
  elements.hydrationBar.style.width = `${hydrationProgress}%`;

  elements.wellnessScore.textContent = String(Math.min(100, totals.wellnessScore));
  const scorePercent = Math.min(100, totals.wellnessScore);
  const ring = elements.wellnessScore.closest('.score-ring');
  if (ring) {
    ring.style.background = `conic-gradient(var(--primary) 0 ${scorePercent}%, #e9f3eb ${scorePercent}% 100%)`;
  }
}

function renderAll() {
  renderMeals();
  renderActivities();
  renderExercises();
  renderHabits();
  renderWater();
  renderOverviewSummary();
  renderInsights();
  syncMetricInputs();
  saveState();
}

function addMeal(event) {
  event.preventDefault();
  const mealName = elements.mealName.value.trim();
  const calories = Number(elements.mealCalories.value) || 0;
  const protein = Number(elements.mealProtein.value) || 0;
  const type = elements.mealType.value;

  if (!mealName) {
    elements.mealName.focus();
    return;
  }

  state.meals.push({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
    type,
    name: mealName,
    calories,
    protein,
  });

  elements.mealForm.reset();
  renderAll();
}

function addActivity(event) {
  event.preventDefault();
  const type = elements.activityType.value;
  const minutes = Number(elements.activityMinutes.value) || 0;

  if (!minutes) {
    elements.activityMinutes.focus();
    return;
  }

  state.activities.push({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
    type,
    minutes,
    category: 'general'
  });

  elements.activityForm.reset();
  renderAll();
}

function addExercise(event) {
  event.preventDefault();
  const type = elements.exerciseType.value;
  const name = elements.exerciseName.value.trim();
  const minutes = Number(elements.exerciseMinutes.value) || 0;
  const calories = Number(elements.exerciseCalories.value) || 0;

  if (!minutes) {
    elements.exerciseMinutes.focus();
    return;
  }

  const exerciseLabel = name ? `${type} · ${name}` : type;

  state.activities.push({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
    type: exerciseLabel,
    minutes,
    calories,
    category: 'exercise'
  });

  elements.exerciseForm.reset();
  renderAll();
}

function toggleHabit(id) {
  const habit = state.habits.find((item) => item.id === id);
  if (!habit) return;
  habit.done = !habit.done;
  renderAll();
}

function removeMeal(id) {
  state.meals = state.meals.filter((meal) => meal.id !== id);
  renderAll();
}

function removeActivity(id) {
  state.activities = state.activities.filter((activity) => activity.id !== id);
  renderAll();
}

function addWater(amount) {
  state.water = Math.max(0, Math.min(state.water + amount, state.goals.water * 2));
  renderAll();
}

function clearWater() {
  state.water = 0;
  renderAll();
}

function updateMetrics(event) {
  event.preventDefault();
  state.metrics.weight = Number(elements.weightInput.value) || state.metrics.weight;
  state.metrics.steps = Number(elements.stepsInput.value) || state.metrics.steps;
  state.metrics.sleep = Number(elements.sleepInput.value) || state.metrics.sleep;
  state.metrics.mood = Number(elements.moodInput.value) || state.metrics.mood;
  state.metrics.bloodPressure = elements.bpInput.value.trim() || state.metrics.bloodPressure;
  renderAll();
}

function updateGoals(event) {
  event.preventDefault();

  const nextCalories = Number(elements.goalCalories.value) || state.goals.calories;
  const nextWater = Number(elements.goalWater.value) || state.goals.water;
  const nextMovement = Number(elements.goalMovement.value) || state.goals.movement;
  const nextSleep = Number(elements.goalSleep.value) || state.goals.sleep;

  state.goals = {
    calories: nextCalories,
    water: nextWater,
    movement: nextMovement,
    sleep: nextSleep,
  };

  renderAll();
}

function toggleDashboardDrawer(forceOpen) {
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !elements.dashboardDrawer.classList.contains('open');
  elements.dashboardDrawer.classList.toggle('open', shouldOpen);
  elements.dashboardDrawer.setAttribute('aria-hidden', String(!shouldOpen));

  if (elements.dashboardBackdrop) {
    elements.dashboardBackdrop.classList.toggle('open', shouldOpen);
    elements.dashboardBackdrop.setAttribute('aria-hidden', String(!shouldOpen));
  }

  if (elements.dashboardToggle) {
    elements.dashboardToggle.setAttribute('aria-expanded', String(shouldOpen));
  }
}

function bindEvents() {
  elements.authModeButtons.forEach((button) => {
    button.removeEventListener('click', handleAuthModeChange);
    button.addEventListener('click', handleAuthModeChange);
    button.setAttribute('aria-pressed', String(button.dataset.authMode === authMode));
  });

  elements.authForm.addEventListener('submit', handleAuthSubmit);
  elements.logoutBtn.addEventListener('click', handleLogout);
  elements.mealForm.addEventListener('submit', addMeal);
  if (elements.exerciseForm) {
    elements.exerciseForm.addEventListener('submit', addExercise);
  }
  elements.activityForm.addEventListener('submit', addActivity);
  elements.metricsForm.addEventListener('submit', updateMetrics);
  if (elements.goalForm) {
    elements.goalForm.addEventListener('submit', updateGoals);
  }
  elements.quickWaterBtn.addEventListener('click', () => addWater(250));

  if (elements.dashboardToggle) {
    elements.dashboardToggle.addEventListener('click', () => toggleDashboardDrawer());
  }

  if (elements.closeDashboardDrawer) {
    elements.closeDashboardDrawer.addEventListener('click', () => toggleDashboardDrawer(false));
  }

  if (elements.dashboardBackdrop) {
    elements.dashboardBackdrop.addEventListener('click', () => toggleDashboardDrawer(false));
  }

  document.querySelectorAll('[data-water]').forEach((button) => {
    button.addEventListener('click', () => addWater(Number(button.dataset.water)));
  });

  document.querySelectorAll('[data-clear-water]').forEach((button) => {
    button.addEventListener('click', clearWater);
  });

  document.querySelectorAll('.stepper-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.stepTarget;
      const input = targetId ? document.getElementById(targetId) : null;
      if (!input) return;

      const step = Number(button.dataset.stepValue) || 0;
      const currentValue = Number(input.value) || 0;
      const minValue = Number(input.min) || Number.NEGATIVE_INFINITY;
      const maxValue = Number(input.max) || Number.POSITIVE_INFINITY;
      const nextValue = Math.min(Math.max(currentValue + step, minValue), maxValue);

      input.value = String(nextValue);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  document.addEventListener('click', (event) => {
    const mealButton = event.target.closest('[data-delete-meal]');
    const activityButton = event.target.closest('[data-delete-activity]');
    const habitButton = event.target.closest('[data-habit-toggle]');

    if (mealButton) {
      removeMeal(mealButton.dataset.deleteMeal);
    }

    if (activityButton) {
      removeActivity(activityButton.dataset.deleteActivity);
    }

    if (habitButton) {
      toggleHabit(habitButton.dataset.habitToggle);
    }
  });
}

async function initializeSession() {
  if (supabaseEnabled && supabaseClient) {
    const { data: sessionData, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.warn('Unable to restore session:', error.message);
    }

    const user = sessionData?.session?.user;
    if (user) {
      currentUser = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        data: createEmptyState()
      };

      state = await loadStateFromSupabaseUser(user.id);
      currentUser.data = structuredClone(state);
      setCurrentUserId(user.id);
      showAppScreen();
      renderAll();
      return;
    }
  }

  const currentUserId = getCurrentUserId();
  const users = getUsers();
  const existingUser = users.find((user) => user.id === currentUserId);

  if (existingUser) {
    currentUser = existingUser;
    hydrateStateFromUser(existingUser);
    showAppScreen();
    renderAll();
    return;
  }

  currentUser = null;
  state = createEmptyState();
  showAuthScreen('Log in to save your personal wellness data.');
}

function initializeApp() {
  bindEvents();
  updateAuthView();
  initializeSession();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
