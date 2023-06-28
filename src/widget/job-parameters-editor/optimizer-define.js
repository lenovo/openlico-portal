/*
 * Copyright 2015-2023 Lenovo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const optimizers = [
  {
    key: 'adadelta',
    label: 'JobTemplate.Optimizer.Adadelta',
    params: [
      {
        key: 'decayRate',
        label: 'JobTemplate.Optimizer.Adadelta.DecayRate',
        type: 'number',
        defaultValue: 0.95,
      },
    ],
  },
  {
    key: 'adagrad',
    label: 'JobTemplate.Optimizer.Adagrad',
    params: [
      {
        key: 'initAccumulator',
        label: 'JobTemplate.Optimizer.Adagrad.InitAccumulator',
        type: 'number',
        defaultValue: 0.1,
      },
    ],
  },
  {
    key: 'adam',
    label: 'JobTemplate.Optimizer.Adam',
    params: [
      {
        key: 'beta1',
        label: 'JobTemplate.Optimizer.Adam.Beta1',
        type: 'number',
        defaultValue: 0.9,
      },
      {
        key: 'beta2',
        label: 'JobTemplate.Optimizer.Adam.Beta2',
        type: 'number',
        defaultValue: 0.999,
      },
      {
        key: 'epsilon',
        label: 'JobTemplate.Optimizer.Adam.Epsilon',
        type: 'number',
        defaultValue: 1.0,
      },
    ],
  },
  {
    key: 'ftrl',
    label: 'JobTemplate.Optimizer.FTRL',
    params: [
      {
        key: 'learningRatePower',
        label: 'JobTemplate.Optimizer.FTRL.LearningRatePower',
        type: 'number',
        defaultValue: -0.5,
      },
      {
        key: 'initAccumulator',
        label: 'JobTemplate.Optimizer.FTRL.InitAccumulator',
        type: 'number',
        defaultValue: 0.1,
      },
      {
        key: 'l1',
        label: 'JobTemplate.Optimizer.FTRL.L1',
        type: 'number',
        defaultValue: 0,
      },
      {
        key: 'l2',
        label: 'JobTemplate.Optimizer.FTRL.L2',
        type: 'number',
        defaultValue: 0,
      },
    ],
  },
  {
    key: 'momentum',
    label: 'JobTemplate.Optimizer.Momentum',
    params: [
      {
        key: 'momentum',
        label: 'JobTemplate.Optimizer.Momentum.Momentum',
        type: 'number',
        defaultValue: 0.9,
      },
    ],
    default: true,
  },
  {
    key: 'sgd',
    label: 'JobTemplate.Optimizer.SGD',
    params: [
      {
        key: 'gradientNorm',
        label: 'JobTemplate.Optimizer.SGD.GradientNorm',
        type: 'number',
        defaultValue: -5.0,
      },
      {
        key: 'maxGradientNorm',
        label: 'JobTemplate.Optimizer.SGD.MaxGradientNorm',
        type: 'number',
        defaultValue: -5.0,
      },
      {
        key: 'gradientNormGlobalFirst',
        label: 'JobTemplate.Optimizer.SGD.GradientNormGlobalFirst',
        type: 'bool',
        defaultValue: false,
      },
    ],
  },
  {
    key: 'rmsprop',
    label: 'JobTemplate.Optimizer.RMSProp',
    params: [
      {
        key: 'momentum',
        label: 'JobTemplate.Optimizer.RMSProp.Momentum',
        type: 'number',
        defaultValue: 0.9,
      },
      {
        key: 'decayRate',
        label: 'JobTemplate.Optimizer.RMSProp.DecayRate',
        type: 'number',
        defaultValue: 0.9,
      },
    ],
  },
]

export default {
  optimizers,
}
