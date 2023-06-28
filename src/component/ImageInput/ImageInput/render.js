export default function (h) {
  return h(
    'div',
    {
      style: this.internalImageData
        ? {
            // display: ['-ms-inline-grid', 'inline-grid'],
            gridColumns: '1fr auto',
            gridRows: '1fr auto',
            gridTemplateColumns: '1fr auto',
            gridTemplateRows: '1fr auto',
            ...(this.fullHeight ? { height: '100%' } : {}),
            ...(this.fullWidth ? { width: '100%' } : {}),
          }
        : {},
    },
    [
      h(
        'div',
        {
          style: this.internalImageData
            ? {
                gridColumn: 1,
                gridRow: 1,
                overflow: 'hidden',
                position: 'relative',
              }
            : {},
        },
        [
          h(
            'div',
            {
              style: this.internalImageData
                ? {
                    alignItems: 'center',
                    background: this.checkeredBackground,
                    display: 'flex',
                    height: '100%',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: `calc(${this.overlayPadding} + ${this.overlayBorderWidth})`,
                    position: 'relative',
                    width: '100%',
                    zIndex: 0,
                    ...(this.internalImageData || this.readonly
                      ? {}
                      : {
                          opacity: 0,
                          pointerEvents: 'none',
                          visibility: 'hidden',
                        }),
                  }
                : {
                    display: 'none',
                  },
              ...(this.internalImageData
                ? this.disabled || this.readonly
                  ? {}
                  : {
                      directives: [
                        {
                          name: 'Claw',
                          arg: 'pan',
                          value: this.onPan,
                        },
                      ],
                    }
                : {}),
            },
            [
              h(
                'div',
                {
                  style: {
                    boxShadow: `0 0 4000px 4000px ${this.overlayBackgroundColor}`,
                    maxHeight: '100%',
                    maxWidth: '100%',
                    outline: `${this.overlayBorderWidth} solid ${this.overlayBorderColor}`,
                    pointerEvents: 'none',
                  },
                },
                [
                  h(
                    'div',
                    {
                      style: this.internalImageData
                        ? {
                            height: `${this.imageHeight}px`,
                            position: 'relative',
                            width: `${this.imageWidth}px`,
                            zIndex: -1,
                            ...(this.imageBackgroundColor ? { backgroundColor: this.imageBackgroundColor } : {}),
                          }
                        : {
                            height: '46px',
                          },
                    },
                    [
                      ...(this.internalImageData
                        ? [
                            h('img', {
                              style: {
                                display: 'block',
                                pointerEvents: 'none',
                                position: 'absolute',
                                transform: [
                                  `translate(${this.croppingLeft}px,${this.croppingTop}px)`,
                                  `scale(${this.scaling})`,
                                  ...(this.rotated
                                    ? [`translateX(${this.internalImageHeight}px)`, 'rotate(90deg)']
                                    : []),
                                  ...(this.flippedVertically
                                    ? [`translateY(${this.internalImageHeight}px)`, 'scaleY(-1)']
                                    : []),
                                  ...(this.flippedHorizontally
                                    ? [`translateX(${this.internalImageWidth}px)`, 'scaleX(-1)']
                                    : []),
                                ].join(' '),
                                transformOrigin: '0 0',
                              },
                              attrs: {
                                src: this.internalImageData,
                              },
                            }),
                          ]
                        : []),
                      ...(this.internalImageData && this.imageData
                        ? [
                            h('input', {
                              attrs: {
                                name: this.name,
                                type: 'hidden',
                                value: this.imageData,
                              },
                            }),
                          ]
                        : []),
                    ],
                  ),
                ],
              ),
            ],
          ),
          ...(this.internalImageData || this.readonly
            ? []
            : [
                h('MyFileUpload', {
                  style: {},
                  on: {
                    load: ({ file: { lastModified, name, size, type }, result }) => {
                      this.$emit('file-info', {
                        name,
                        size,
                        type,
                        lastModified,
                      })
                      this.load(result)
                    },
                  },
                }),
              ]),
        ],
      ),
      h(
        'div',
        {
          style: this.internalImageData
            ? {
                margin: '4px 0',
                display: 'flex',
                // textAlign: 'center',
                ...(this.internalImageData
                  ? {}
                  : {
                      opacity: 0,
                      pointerEvents: 'none',
                      visibility: 'hidden',
                    }),
              }
            : {
                display: 'none',
              },
        },
        [
          ...(this.hideActions || this.readonly
            ? []
            : [
                h(
                  'AInputGroup',
                  {
                    style: {
                      display: 'inline-block',
                      marginTop: '2px',
                      width: '20%',
                    },
                    props: {
                      compact: true,
                    },
                  },
                  [h('MyZoomOut'), h('MyScaleInput'), h('MyZoomIn')],
                ),
                h('MyRotateCounterClockwiseButton'),
                h('MyRotateClockwiseButton'),
                h('MyFlipHorizontallyButton'),
                h('MyFlipVerticallyButton'),
              ]),
        ],
      ),
    ],
  )
}
