(function() {
  'use strict';

  var ws = null;
  var isPaused = false;

  // Init
  document.addEventListener('DOMContentLoaded', function() {
    connectWS();
    refreshTasks();
    refreshStats();
    setInterval(refreshStats, 10000);
  });

  // WebSocket
  function connectWS() {
    var proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(proto + '//' + location.host + '/ws');

    ws.onopen = function() {
      document.getElementById('statusDot').className = 'status-dot running';
      document.getElementById('statusLabel').textContent = 'Connected';
    };

    ws.onclose = function() {
      document.getElementById('statusDot').className = 'status-dot stopped';
      document.getElementById('statusLabel').textContent = 'Disconnected';
      setTimeout(connectWS, 3000);
    };

    ws.onmessage = function(e) {
      var msg = JSON.parse(e.data);
      handleMessage(msg);
    };
  }

  function handleMessage(msg) {
    if (msg.type === 'log_entry') {
      addLog(msg);
    } else if (msg.type === 'task_update' || msg.type === 'task_created' || msg.type === 'task_deleted') {
      refreshTasks();
      refreshStats();
    } else if (msg.type === 'batch_created') {
      refreshTasks();
      refreshStats();
      addLog({ level: 'info', message: msg.count + ' tasks created', timestamp: new Date().toISOString() });
    } else if (msg.type === 'queue_status') {
      isPaused = msg.paused;
      updatePauseBtn();
    }
  }

  function addLog(entry) {
    var feed = document.getElementById('logFeed');
    var div = document.createElement('div');
    div.className = 'log-entry ' + (entry.level || 'info');
    var time = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '--:--:--';
    var taskTag = entry.task_id ? '[#' + entry.task_id + '] ' : '';
    div.innerHTML = '<span class="time">' + time + '</span> <span class="msg">' + taskTag + escapeHtml(entry.message) + '</span>';
    feed.insertBefore(div, feed.firstChild);
    if (feed.children.length > 200) feed.removeChild(feed.lastChild);
  }

  // API calls
  window.refreshTasks = function() {
    fetch('/api/tasks').then(function(r) { return r.json(); }).then(function(tasks) {
      renderTable(tasks);
    });
  };

  function refreshStats() {
    fetch('/api/stats').then(function(r) { return r.json(); }).then(function(s) {
      document.getElementById('statTotal').textContent = s.total || 0;
      document.getElementById('statPending').textContent = s.pending || 0;
      document.getElementById('statRunning').textContent = s.running || 0;
      document.getElementById('statCompleted').textContent = s.completed || 0;
      document.getElementById('statFailed').textContent = s.failed || 0;
    });
  }

  function renderTable(tasks) {
    var tbody = document.getElementById('taskTable');
    if (!tasks.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><h3>No tasks yet</h3>Click "+ Add Task" or batch buttons above to get started</td></tr>';
      return;
    }
    tbody.innerHTML = tasks.map(function(t) {
      return '<tr>' +
        '<td>' + t.id + '</td>' +
        '<td><span class="type-badge type-' + t.task_type + '">' + t.task_type + '</span></td>' +
        '<td>' + escapeHtml(t.target_site) + '</td>' +
        '<td>' + escapeHtml(t.title || '') + '</td>' +
        '<td><span class="badge badge-' + t.status + '">' + t.status + '</span></td>' +
        '<td>' +
          (t.status === 'failed' ? '<button class="btn btn-sm btn-ghost" onclick="retryTask(' + t.id + ')">Retry</button> ' : '') +
          '<button class="btn btn-sm btn-danger" onclick="deleteTask(' + t.id + ')">Del</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  window.createTask = function() {
    var type = document.getElementById('taskType').value;
    var target = document.getElementById('taskTarget').value;
    var title = document.getElementById('taskTitle').value;
    var desc = document.getElementById('taskDesc').value;
    var configStr = document.getElementById('taskConfig').value;

    if (!target || !title) { alert('Target and Title required'); return; }

    var config = {};
    try { config = JSON.parse(configStr); } catch(e) { config = {}; }

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_type: type,
        target_site: target,
        title: title,
        description: desc,
        config: config
      })
    }).then(function() {
      hideModal();
      refreshTasks();
      refreshStats();
    });
  };

  window.deleteTask = function(id) {
    if (!confirm('Delete task #' + id + '?')) return;
    fetch('/api/tasks/' + id, { method: 'DELETE' }).then(function() {
      refreshTasks();
      refreshStats();
    });
  };

  window.retryTask = function(id) {
    fetch('/api/tasks/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending' })
    }).then(function() {
      refreshTasks();
      refreshStats();
    });
  };

  window.batchCreate = function(type) {
    if (!confirm('Create all ' + type + ' tasks?')) return;
    fetch('/api/tasks/batch/' + type, { method: 'POST' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        addLog({ level: 'info', message: data.created + ' ' + type + ' tasks created', timestamp: new Date().toISOString() });
        refreshTasks();
        refreshStats();
      });
  };

  window.togglePause = function() {
    var action = isPaused ? 'resume' : 'pause';
    fetch('/api/queue/' + action, { method: 'POST' }).then(function() {
      isPaused = !isPaused;
      updatePauseBtn();
    });
  };

  function updatePauseBtn() {
    var btn = document.getElementById('pauseBtn');
    btn.textContent = isPaused ? 'Resume' : 'Pause';
    btn.className = isPaused ? 'btn btn-success' : 'btn btn-warning';
    document.getElementById('statusDot').className = isPaused ? 'status-dot paused' : 'status-dot running';
    document.getElementById('statusLabel').textContent = isPaused ? 'Paused' : 'Running';
  }

  window.showModal = function() {
    document.getElementById('modal').classList.add('active');
    document.getElementById('taskTarget').value = '';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('taskConfig').value = '{}';
  };

  window.hideModal = function() {
    document.getElementById('modal').classList.remove('active');
  };

  window.updateTargetOptions = function() {
    // Could pre-fill targets based on type
  };

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
