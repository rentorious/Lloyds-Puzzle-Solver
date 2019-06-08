class Puzzle {
  constructor(startState) {
    this.startState = this.serialize(startState);
    this.endState = this.serialize([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 0]
    ]);
    this.steps = [];
    this.path = [];
    this.cols = 3;
    this.rows = 3;
  }

  getDeserialized(state) {
    return this.deserialize(state);
  }

  scramble(stepNum) {
    let states = [this.startState];
    for (let i = 0; i < stepNum; i++) {

      let neighbors = this.getNeighbors(states[i]);
      let index = Math.floor(Math.random() * neighbors.length);

      states.push(neighbors[index].neighbor);

    }

    return states;
  }

  setStartState(state) {
    if (typeof state === "string" || state instanceof String)
      this.startState = state;
    else this.startState = this.serialize(state);
  }

  setEndState(state) {
    if (typeof state === "string" || state instanceof String)
      this.endState = state;
    else this.endState = this.serialize(state);
  }

  serialize(state) {
    let flattened = [];

    for (let i = 0; i < state.length; i++) {
      for (let j = 0; j < state[i].length; j++) {
        flattened.push(state[i][j]);
      }
    }

    return flattened.join(":");
  }

  deserialize(state) {
    let flattened = state.split(":").map(Number);
    let deserialized = [];
    for (let i = 0; i < this.rows; i++) {
      let row = [];
      for (let j = 0; j < this.cols; j++) {
        row.push(flattened[i * this.cols + j]);
      }

      deserialized.push(row);
    }

    return deserialized;
  }

  getNeighbors(state) {
    let matrix = this.deserialize(state);
    let neighbors = [];


    let y = -1;
    let x = -1;

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] == 0) {
          x = j;
          y = i;
        }
      }
    }

    if (x > 0) {
      let newMatrix = JSON.parse(JSON.stringify(matrix));
      newMatrix[y][x] = newMatrix[y][x - 1];
      newMatrix[y][x - 1] = 0;
      neighbors.push({
        neighbor: this.serialize(newMatrix),
        weight: Infinity
      });
    }
    if (x < this.cols - 1) {
      let newMatrix = JSON.parse(JSON.stringify(matrix));
      newMatrix[y][x] = newMatrix[y][x + 1];
      newMatrix[y][x + 1] = 0;
      neighbors.push({
        neighbor: this.serialize(newMatrix),
        weight: Infinity
      });
    }
    if (y > 0) {
      let newMatrix = JSON.parse(JSON.stringify(matrix));
      newMatrix[y][x] = newMatrix[y - 1][x];
      newMatrix[y - 1][x] = 0;
      neighbors.push({
        neighbor: this.serialize(newMatrix),
        weight: Infinity
      });
    }
    if (y < this.rows - 1) {
      let newMatrix = JSON.parse(JSON.stringify(matrix));
      newMatrix[y][x] = newMatrix[y + 1][x];
      newMatrix[y + 1][x] = 0;
      neighbors.push({
        neighbor: this.serialize(newMatrix),
        weight: Infinity
      });
    }

    return neighbors;
  }

  manhattanDist(state) {
    state = this.deserialize(state);

    let dist = 0;
    let rows = state.length;
    let cols = state[0].length;
    let iShould = -1;
    let jShould = -1;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (state[i][j] == 0) {
          iShould = rows - 1;
          jShould = cols - 1;
        } else {
          iShould = Math.floor((state[i][j] - 1) / rows);
          jShould = Math.floor((state[i][j] - 1) % cols);
        }

        dist += Math.abs(j - jShould) + Math.abs(i - iShould);
      }
    }

    return dist;
  }

  solve(algorithm) {
    if (algorithm == "greedy") return this.greedy();
    else if (algorithm == "dijkstra") return this.dijkstra();
    else if (algorithm == "bfs") return this.bfs();
    else if (algorithm == "dfs") return this.dfs();
  }

  getPath(state, parent) {
    let path = [];
    do {
      path.push(state);
      state = parent[state];
    } while (state != null);

    path.reverse();

    return path;
  }

  bfs() {
    let state = this.startState;
    let iteration_num = 0;
    let parent = {};
    let queue = [state];
    parent[state] = null;

    while (queue.length) {
      state = queue.pop();
      iteration_num++;


      if (state == this.endState) {
        this.path = this.getPath(state, parent);
        return iteration_num;
      }

      let neighbors = this.getNeighbors(state);
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i].neighbor;
        if (!(neighbor in parent)) {
          parent[neighbor] = state;
          queue.unshift(neighbor);
        }
      }
    }
    return -iteration_num;
  }

  dfs() {
    let state = this.startState;
    let visited = Set([state]);
    let path = [state];
    let iteration_num = 0;

    while (path.length) {
      iteration_num++;
      if (iteration_num % 5000 == 0) {

      }
      let hasUnvisited = false;
      state = path[path.length - 1];

      if (state == this.endState) {
        this.path = path;
        return iteration_num;
      }

      let neighbors = this.getNeighbors(state);
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i].neighbor;

        if (!(neighbor in visited)) {
          visited.add(neighbor);
          path.push(neighbor);
          hasUnvisited = true;
          break;
        }
      }

      if (!hasUnvisited) {
        state = path.pop();
      }
    }

    return -1;
  }

  greedy() {
    let parent = {};
    parent[this.startState] = null;
    let state = this.startState;
    let dist = this.manhattanDist(state);

    let iteration_num = 0;
    while (1) {
      iteration_num++;
      let nextState = null;
      let minDist = Infinity;
      let neighbors = this.getNeighbors(state);


      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i].neighbor;
        let manhattan = this.manhattanDist(neighbor);

        if (manhattan <= minDist) {
          minDist = manhattan;
          nextState = neighbor;
        }
      }

      if (state == this.endState) {
        this.path = this.getPath(state, parent);
        return iteration_num;
      } else if (minDist < dist) {
        parent[nextState] = state;
        state = nextState;
        dist = minDist;
      } else {
        this.path = null;
        return -iteration_num;
      }
    }
  }

  dijkstra() {
    let parent = {};
    parent[this.startState] = null;

    let steps = [];

    let q = new Set([this.startState]);

    let d = {};
    d[this.startState] = 0;

    let iteration_num = 0;

    while (q.size > 0) {
      let n = null;

      let minDistance = Infinity;
      for (let v of q) {
        if (d[v] < minDistance) {
          n = v;
          minDistance = d[v];
        }
      }

      if (n == null) return -iteration_num;

      steps.push(n);

      if (n == this.endState) {

        this.steps = steps;
        this.setStartState(n);
        this.path = this.getPath(n, parent);
        return iteration_num;
      }

      let neighbors = this.getNeighbors(n);
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i].neighbor;
        if (!(neighbor in d) || d[n] + 1 < d[neighbor]) {
          d[neighbor] = d[n] + 1;
          q.add(neighbor);
          parent[neighbor] = n;
        }
      }

      iteration_num++;
      q.delete(n);
    }
    return -iteration_num;
  }
}