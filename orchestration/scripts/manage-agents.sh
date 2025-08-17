#!/bin/bash

# ReportBuilder Multi-Agent Management Script
# Provides commands to manage all agents collectively

set -e

# Agent configuration
declare -A agents
agents["task-3"]="Properties Panel Agent:3003:reportbuilder-task-3"
agents["task-4"]="Undo/Redo System Agent:3004:reportbuilder-task-4"
agents["task-5"]="Database Setup Agent:3005:reportbuilder-task-5"
agents["task-6"]="Data Binding Agent:3006:reportbuilder-task-6"
agents["task-7"]="PDF Generation Agent:3007:reportbuilder-task-7"
agents["task-8"]="Templates Agent:3008:reportbuilder-task-8"

BASE_DIR="/Users/peak/dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if agent is running
is_agent_running() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0
    else
        return 1
    fi
}

# Show usage
show_usage() {
    echo "ReportBuilder Multi-Agent Management"
    echo ""
    echo "Usage: $0 <command> [agent]"
    echo ""
    echo "Commands:"
    echo "  status          Show status of all agents"
    echo "  start [agent]   Start agent(s) development server"
    echo "  stop [agent]    Stop agent(s) development server"
    echo "  restart [agent] Restart agent(s) development server"
    echo "  build [agent]   Build agent(s)"
    echo "  test [agent]    Run tests for agent(s)"
    echo "  lint [agent]    Run linting for agent(s)"
    echo "  install [agent] Install dependencies for agent(s)"
    echo "  sync            Sync all agents with main branch"
    echo "  health          Health check for all agents"
    echo ""
    echo "Agents:"
    for task in "${!agents[@]}"; do
        IFS=':' read -r name port dir <<< "${agents[$task]}"
        echo "  $task    $name (port $port)"
    done
    echo ""
    echo "Examples:"
    echo "  $0 status                    # Show all agent status"
    echo "  $0 start task-3              # Start Properties Panel Agent"
    echo "  $0 start                     # Start all agents"
    echo "  $0 build task-5 task-6       # Build specific agents"
}

# Show agent status
show_status() {
    print_header "Agent Status Report"
    
    for task in "${!agents[@]}"; do
        IFS=':' read -r name port dir <<< "${agents[$task]}"
        
        echo -e "\n${BLUE}$name${NC}"
        echo "├── Directory: $BASE_DIR/$dir"
        echo "├── Port: $port"
        
        if [ -d "$BASE_DIR/$dir" ]; then
            echo "├── Worktree: ✅ exists"
            
            if is_agent_running $port; then
                echo "├── Status: 🟢 RUNNING (http://localhost:$port)"
            else
                echo "├── Status: 🔴 STOPPED"
            fi
            
            cd "$BASE_DIR/$dir"
            if [ -d "node_modules" ]; then
                echo "└── Dependencies: ✅ installed"
            else
                echo "└── Dependencies: ❌ missing"
            fi
        else
            echo "└── Worktree: ❌ missing"
        fi
    done
}

# Start agents
start_agents() {
    local target_agents=("$@")
    
    if [ ${#target_agents[@]} -eq 0 ]; then
        target_agents=("${!agents[@]}")
    fi
    
    print_header "Starting Agents"
    
    for task in "${target_agents[@]}"; do
        if [[ ! ${agents[$task]+_} ]]; then
            print_error "Unknown agent: $task"
            continue
        fi
        
        IFS=':' read -r name port dir <<< "${agents[$task]}"
        
        if is_agent_running $port; then
            print_warning "$name already running on port $port"
            continue
        fi
        
        echo "Starting $name on port $port..."
        cd "$BASE_DIR/$dir"
        
        # Start in background with output redirection
        npm run dev > "/tmp/$task.log" 2>&1 &
        local pid=$!
        echo $pid > "/tmp/$task.pid"
        
        # Wait a moment and check if it started successfully
        sleep 3
        if is_agent_running $port; then
            print_success "$name started successfully (PID: $pid)"
        else
            print_error "Failed to start $name"
        fi
    done
}

# Stop agents
stop_agents() {
    local target_agents=("$@")
    
    if [ ${#target_agents[@]} -eq 0 ]; then
        target_agents=("${!agents[@]}")
    fi
    
    print_header "Stopping Agents"
    
    for task in "${target_agents[@]}"; do
        if [[ ! ${agents[$task]+_} ]]; then
            print_error "Unknown agent: $task"
            continue
        fi
        
        IFS=':' read -r name port dir <<< "${agents[$task]}"
        
        if ! is_agent_running $port; then
            print_warning "$name not running"
            continue
        fi
        
        echo "Stopping $name on port $port..."
        
        # Kill process using port
        local pid=$(lsof -t -i:$port)
        if [ ! -z "$pid" ]; then
            kill $pid
            print_success "$name stopped"
        fi
        
        # Clean up PID file
        if [ -f "/tmp/$task.pid" ]; then
            rm "/tmp/$task.pid"
        fi
    done
}

# Build agents
build_agents() {
    local target_agents=("$@")
    
    if [ ${#target_agents[@]} -eq 0 ]; then
        target_agents=("${!agents[@]}")
    fi
    
    print_header "Building Agents"
    
    for task in "${target_agents[@]}"; do
        if [[ ! ${agents[$task]+_} ]]; then
            print_error "Unknown agent: $task"
            continue
        fi
        
        IFS=':' read -r name port dir <<< "${agents[$task]}"
        
        echo "Building $name..."
        cd "$BASE_DIR/$dir"
        
        if npm run build; then
            print_success "$name built successfully"
        else
            print_error "Failed to build $name"
        fi
    done
}

# Run tests
test_agents() {
    local target_agents=("$@")
    
    if [ ${#target_agents[@]} -eq 0 ]; then
        target_agents=("${!agents[@]}")
    fi
    
    print_header "Running Tests"
    
    for task in "${target_agents[@]}"; do
        if [[ ! ${agents[$task]+_} ]]; then
            print_error "Unknown agent: $task"
            continue
        fi
        
        IFS=':' read -r name port dir <<< "${agents[$task]}"
        
        echo "Testing $name..."
        cd "$BASE_DIR/$dir"
        
        if npm run test; then
            print_success "$name tests passed"
        else
            print_error "$name tests failed"
        fi
    done
}

# Run linting
lint_agents() {
    local target_agents=("$@")
    
    if [ ${#target_agents[@]} -eq 0 ]; then
        target_agents=("${!agents[@]}")
    fi
    
    print_header "Running Linting"
    
    for task in "${target_agents[@]}"; do
        if [[ ! ${agents[$task]+_} ]]; then
            print_error "Unknown agent: $task"
            continue
        fi
        
        IFS=':' read -r name port dir <<< "${agents[$task]}"
        
        echo "Linting $name..."
        cd "$BASE_DIR/$dir"
        
        if npm run lint; then
            print_success "$name linting passed"
        else
            print_error "$name linting failed"
        fi
    done
}

# Install dependencies
install_agents() {
    local target_agents=("$@")
    
    if [ ${#target_agents[@]} -eq 0 ]; then
        target_agents=("${!agents[@]}")
    fi
    
    print_header "Installing Dependencies"
    
    for task in "${target_agents[@]}"; do
        if [[ ! ${agents[$task]+_} ]]; then
            print_error "Unknown agent: $task"
            continue
        fi
        
        IFS=':' read -r name port dir <<< "${agents[$task]}"
        
        echo "Installing dependencies for $name..."
        cd "$BASE_DIR/$dir"
        
        if npm install; then
            print_success "$name dependencies installed"
        else
            print_error "Failed to install dependencies for $name"
        fi
    done
}

# Sync with main branch
sync_agents() {
    print_header "Syncing Agents with Main Branch"
    
    cd "$BASE_DIR/reportbuilder"
    
    # First, sync main branch
    echo "Syncing main branch..."
    git checkout main
    git pull origin main
    
    # Then sync each agent
    for task in "${!agents[@]}"; do
        IFS=':' read -r name port dir <<< "${agents[$task]}"
        
        echo "Syncing $name..."
        cd "$BASE_DIR/$dir"
        
        # Merge latest changes from main
        git merge main
        
        if [ $? -eq 0 ]; then
            print_success "$name synced with main"
        else
            print_warning "$name has merge conflicts - resolve manually"
        fi
    done
}

# Health check
health_check() {
    print_header "Agent Health Check"
    
    local healthy=0
    local total=${#agents[@]}
    
    for task in "${!agents[@]}"; do
        IFS=':' read -r name port dir <<< "${agents[$task]}"
        
        echo -e "\n${BLUE}Checking $name${NC}"
        
        # Check directory exists
        if [ ! -d "$BASE_DIR/$dir" ]; then
            print_error "Worktree missing"
            continue
        fi
        
        cd "$BASE_DIR/$dir"
        
        # Check dependencies
        if [ ! -d "node_modules" ]; then
            print_error "Dependencies not installed"
            continue
        fi
        
        # Check TypeScript
        if ! npm run type-check >/dev/null 2>&1; then
            print_error "TypeScript errors detected"
            continue
        fi
        
        # Check build
        if ! npm run build >/dev/null 2>&1; then
            print_error "Build failed"
            continue
        fi
        
        print_success "$name healthy"
        ((healthy++))
    done
    
    echo -e "\n${BLUE}Health Summary: $healthy/$total agents healthy${NC}"
    
    if [ $healthy -eq $total ]; then
        print_success "All agents are healthy!"
        return 0
    else
        print_warning "Some agents need attention"
        return 1
    fi
}

# Main command dispatcher
main() {
    local command=$1
    shift
    
    case $command in
        "status")
            show_status
            ;;
        "start")
            start_agents "$@"
            ;;
        "stop")
            stop_agents "$@"
            ;;
        "restart")
            stop_agents "$@"
            sleep 2
            start_agents "$@"
            ;;
        "build")
            build_agents "$@"
            ;;
        "test")
            test_agents "$@"
            ;;
        "lint")
            lint_agents "$@"
            ;;
        "install")
            install_agents "$@"
            ;;
        "sync")
            sync_agents
            ;;
        "health")
            health_check
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"