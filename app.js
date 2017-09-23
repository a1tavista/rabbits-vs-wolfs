"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const MathModel = {
    bornRate: {
      rabbit: -0.35,
      wolf: -2,
      grass: 0.8,
    },
    consumeRate: {
      rabbitToGrass: 0.002,
      wolfToRabbit: 0.05,
    },
    growRate: {
      rabbitToGrass: 0.001,
      wolfToRabbit: 0.005,
    },
    h: 0.001,
    step(rabbit, grass, wolf) {
      let ngrass = (this.bornRate.grass - this.consumeRate.rabbitToGrass * rabbit) * grass * this.h + grass;
      let nrabbit = (this.bornRate.rabbit + this.growRate.rabbitToGrass * grass - this.consumeRate.wolfToRabbit * wolf) * rabbit * this.h + rabbit;
      let nwolf = (this.bornRate.wolf + this.growRate.wolfToRabbit * rabbit) * wolf * this.h + wolf;

      return {
        rabbit: Math.max(nrabbit, 0),
        grass: Math.max(ngrass, 0),
        wolf: Math.max(nwolf, 0)
      };
    },
    recalculate(rabbit, grass, wolf, actionCallback, globalContent) {
      let i = 0;
      let vm = this;

      const firstRabbitValue = rabbit;
      const firstGrassValue = grass;
      const firstWolfValue = wolf;

      return new Promise(function (resolve, reject) {
        setTimeout(function run() {
          const res = vm.step(rabbit, grass, wolf);
          actionCallback.call(globalContent, res);
          rabbit = res.rabbit;
          grass = res.grass;
          wolf = res.wolf;

          if (rabbit <= 0.5)
            return reject('Ну вот, все зайцы вымерли :( Попробуйте ещё раз!');

          if (grass <= 0.5)
            return reject('Ну вот, всю траву съели :( Попробуйте ещё раз!');

          if (wolf <= 0.5)
            return reject('Ну вот, все волки вымерли :( Попробуйте ещё раз!');

          if (i < 10000) {
            i++;
            document.querySelector('#trigger_percents').innerHTML = `(${(i - i % 100) / 100}%)`;
            setTimeout(run, 15);
          } else if (i == 10000) {
            resolve('Поздравляем, ваша экосистема стабильна! Отличный результат!');
          }
        }, 15);
      });
    }
  }

  const Visualizer = {
    wolfNodes: [],
    rabbitNodes: [],
    grassNodes: [],

    wolfNodeCapacity: 1,
    rabbitNodeCapacity: 5,
    grassNodeCapacity: 10,

    pushNode(type) {
      let node;
      const imgNode = document.createElement('img');

      switch (type) {
        case 'rabbit':
          imgNode.src = 'rabbit.svg';
          this.rabbitNodes.push(imgNode);
          break;

        case 'wolf':
          imgNode.src = 'wolf.svg';
          this.wolfNodes.push(imgNode);
          break;

        case 'grass':
          imgNode.src = 'grass.jpg';
          this.grassNodes.push(imgNode);
          break;
      }
      document.getElementById(`${type}_container`).appendChild(imgNode);
    },

    popNode(type) {
      let node;
      switch (type) {
        case 'rabbit':
          node = this.rabbitNodes.pop();
          break;

        case 'wolf':
          node = this.wolfNodes.pop();
          break;

        case 'grass':
          node = this.grassNodes.pop();
          break;
      }
      if (node !== undefined)
        node.remove();
    },

    divide(val, by) {
      return (val - val % by) / by;
    },

    check(oldValue, newValue, type) {
      if (oldValue > newValue) {
        for (let i = 0; i < (oldValue - newValue); i++) {
          this.popNode(type);
        }
      } else if (oldValue < newValue) {
        for (let i = 0; i < (newValue - oldValue); i++) {
          this.pushNode(type);
        }
      }
    },

    redraw(currentValues) {
      const rabbitNodesCount = this.divide(currentValues.rabbit, this.rabbitNodeCapacity);
      const wolfNodesCount = this.divide(currentValues.wolf, this.wolfNodeCapacity);
      const grassNodesCount = this.divide(currentValues.grass, this.grassNodeCapacity);

      document.querySelector('#rabbit_count').value = currentValues.rabbit;
      document.querySelector('#grass_count').value = currentValues.grass;
      document.querySelector('#wolf_count').value = currentValues.wolf;

      this.check(this.rabbitNodes.length, rabbitNodesCount, 'rabbit');
      this.check(this.wolfNodes.length, wolfNodesCount, 'wolf');
      this.check(this.grassNodes.length, grassNodesCount, 'grass');
    }
  };

  document.querySelector('#trigger').onclick = function () {
    const rabbit = +document.querySelector('#rabbit_count').value;
    const grass = +document.querySelector('#grass_count').value;
    const wolf = +document.querySelector('#wolf_count').value;
    document.querySelector('#message').innerHTML = '';

    MathModel.recalculate(rabbit, grass, wolf, Visualizer.redraw, Visualizer)
      .then(function (result) {
        document.querySelector('#trigger_percents').innerHTML = null;
        document.querySelector('#message').innerHTML = result;
        document.querySelector('#rabbit_count').value = null;
        document.querySelector('#grass_count').value = null;
        document.querySelector('#wolf_count').value = null;
      })
      .catch(function (result) {
        document.querySelector('#trigger_percents').innerHTML = null;
        document.querySelector('#message').innerHTML = result;
        document.querySelector('#rabbit_count').value = null;
        document.querySelector('#grass_count').value = null;
        document.querySelector('#wolf_count').value = null;
      });
  }

  window.WolfsVsRabbits = { MathModel, Visualizer };
});
