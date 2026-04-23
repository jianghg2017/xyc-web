# TASK-001 任务跟踪指南

## 📊 跟踪方式

### 方式 1: 手动检查（推荐）

**快速检查命令：**
```powershell
# 查看所有运行中的子智能体
subagents list --active

# 查看所有会话
sessions list

# 查看特定子智能体详情
sessions history --session <session-key>
```

**手动更新状态：**
编辑 `tasks/TASK-001/status.md` 文件，更新各阶段状态。

---

### 方式 2: 使用 WinClaw 心跳机制

在 `HEARTBEAT.md` 中添加检查任务：

```markdown
# 子智能体状态检查

## 检查 TASK-001 相关子智能体
- 运行 `subagents list --active`
- 更新 `tasks/TASK-001/status.md`
- 如有完成的任务，通知用户
```

当收到心跳请求时，自动执行检查。

---

### 方式 3: Windows 任务计划程序

**创建定时任务（每 15 分钟）：**

```powershell
# 复制以下命令到 PowerShell 运行
$scriptPath = "C:\Users\admin\AppData\Roaming\winclaw\.openclaw\workspace\scripts\check-subagent-status.ps1"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Once (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration ([TimeSpan]::FromHours(12))
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable
Register-ScheduledTask -TaskName "WinClaw-Subagent-Tracker-TASK-001" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "每 15 分钟检查 TASK-001 子智能体状态" -Force
```

**查看已创建的任务：**
```powershell
Get-ScheduledTask -TaskName "WinClaw-Subagent-Tracker-TASK-001" | Format-Table TaskName, State, NextRunTime
```

**删除任务：**
```powershell
Unregister-ScheduledTask -TaskName "WinClaw-Subagent-Tracker-TASK-001" -Confirm:$false
```

---

## 📝 当前任务状态

### TASK-001: 公司官网开发

| 阶段 | 状态 | 子智能体 ID | 备注 |
|------|------|-----------|------|
| PRD 分析 | ✅ 完成 | 25c0b469 | 20:15 完成 |
| UI/UX 设计 | 🔄 进行中 | e8baf287 | 运行约 25 分钟 |
| 前端开发 | ⏳ 等待 | - | 等待设计完成 |
| 后端开发 | ⏳ 等待 | - | 可立即启动 |
| 测试 | ⏳ 等待 | - | 等待开发完成 |
| 文档 | ⏳ 等待 | - | 最后阶段 |

### 下次检查
- **时间**: 每 15 分钟自动检查（如已配置定时任务）
- **位置**: `tasks/TASK-001/status.md`
- **日志**: `memory/heartbeat-state.json`

---

## 🔔 状态变化通知

当子智能体状态变化时，会：

1. 更新 `tasks/TASK-001/status.md`
2. 记录到 `memory/heartbeat-state.json`
3. 主智能体主动通知用户

---

## 💡 快捷操作

### 立即检查
```
subagents list
```

### 查看 UI/UX 设计进度
```
sessions history --session agent:main:subagent:e8baf287-899d-4fec-8fe7-8c54b6f15be6
```

### 启动后端开发（无需等待设计）
```
spawn subagent:
  role: Backend Developer
  task: 根据 PRD 实现后端 API
  input: tasks/TASK-001/prd.md
  output: tasks/TASK-001/backend/
  background: true
```

### 手动更新状态文件
编辑 `tasks/TASK-001/status.md`，更新对应阶段的状态标记：
- ✅ 完成
- 🔄 进行中
- ⏳ 等待
- ❌ 失败

---

## 📚 相关文件

| 文件 | 用途 |
|------|------|
| `tasks/TASK-001/status.md` | 项目状态跟踪 |
| `tasks/TASK-001/prd.md` | PRD 文档 |
| `tasks/TASK-001/design/` | 设计文件输出 |
| `SUBAGENTS.md` | 子智能体配置框架 |
| `SUBAGENT-EXAMPLES.md` | 使用示例 |
| `memory/heartbeat-state.json` | 心跳检查日志 |

---

## ⚙️ 配置说明

### 推荐配置
- ✅ 使用心跳机制（无需额外进程）
- ✅ 手动检查关键节点
- ✅ 状态变化时主动通知

### 可选配置
- ⚪ Windows 定时任务（需要保持电脑开机）
- ⚪ 邮件/消息通知（需额外配置）

---

**最后更新**: 2026-04-11 20:17
**维护者**: WinClaw AI 助手
