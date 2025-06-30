document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const moodModal = document.getElementById('moodModal');
    const closeModal = document.querySelector('.close');
    const selectedDateSpan = document.getElementById('selectedDate');
    const moodButtons = document.querySelectorAll('#moodButtons button');
    const noteInput = document.getElementById('note');
    const saveBtn = document.getElementById('saveBtn');

    let selectedDate = null;
    let moods = {};

    // Mood colors
    const moodColors = {
        1: '#8B0000',
        2: '#FF4444',
        3: '#888888',
        4: '#90EE90',
        5: '#228B22'
    };

    // Generate calendar for current month
    function generateCalendar(year, month) {
        calendar.innerHTML = '';
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay(); // Sunday=0
        const totalDays = lastDay.getDate();

        // Add blank days for previous month
        for (let i = 0; i < startDay; i++) {
            const blankDay = document.createElement('div');
            blankDay.classList.add('day');
            calendar.appendChild(blankDay);
        }

        // Add days of current month
        for (let day = 1; day <= totalDays; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayDiv.textContent = day;
            dayDiv.dataset.date = dateStr;

            // Color code based on mood
            if (moods[dateStr]) {
                dayDiv.style.backgroundColor = moodColors[moods[dateStr].mood];
                dayDiv.style.color = moods[dateStr].mood <= 3 ? 'white' : 'black';
            }

            dayDiv.addEventListener('click', () => {
                selectedDate = dateStr;
                selectedDateSpan.textContent = selectedDate;
                noteInput.value = moods[selectedDate] ? moods[selectedDate].note : '';
                moodButtons.forEach(btn => btn.classList.remove('selected'));
                if (moods[selectedDate]) {
                    const selectedMoodBtn = Array.from(moodButtons).find(btn => btn.dataset.mood === moods[selectedDate].mood);
                    if (selectedMoodBtn) selectedMoodBtn.classList.add('selected');
                }
                moodModal.style.display = 'block';
            });

            calendar.appendChild(dayDiv);
        }
    }

    // Fetch moods from backend
    async function fetchMoods() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/moods');
            const data = await response.json();
            moods = {};
            data.forEach(entry => {
                moods[entry.date] = { mood: entry.mood, note: entry.note };
            });
            const today = new Date();
            generateCalendar(today.getFullYear(), today.getMonth());
        } catch (error) {
            console.error('Error fetching moods:', error);
        }
    }

    // Save mood entry
    saveBtn.addEventListener('click', async () => {
        const selectedMoodBtn = document.querySelector('#moodButtons button.selected');
        if (!selectedMoodBtn) {
            alert('Please select a mood');
            return;
        }
        const mood = selectedMoodBtn.dataset.mood;
        const note = noteInput.value;

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/moods/${selectedDate}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood, note })
            });
            const result = await response.json();
            if (result.success) {
                moods[selectedDate] = { mood, note };
                generateCalendar(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth());
                moodModal.style.display = 'none';
            } else {
                alert('Failed to save mood');
            }
        } catch (error) {
            console.error('Error saving mood:', error);
        }
    });

    // Mood button selection
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        moodModal.style.display = 'none';
    });

    // Close modal on outside click
    window.addEventListener('click', (event) => {
        if (event.target === moodModal) {
            moodModal.style.display = 'none';
        }
    });

    fetchMoods();
});
