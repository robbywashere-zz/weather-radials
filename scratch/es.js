// Código prototipo preliminar no refactorizado
// Prototype code not refactorized

(function() {

    var VEL_INTERFAZ = 600,
        radio = 250,
        radioHours = radio + 12,
        formulaRadioDesglose = (radio * .75) * 2,
        isOuterRadio = 0,
        demanda,
        consumoMaximo,
        consumoMinimo,
        consumoMedio,
        canvasWidth = 960,
        canvasHeight = 600,
        centerX = canvasWidth * .4,
        centerY = canvasHeight / 2,
        lastJsonData;

    //SUMA LOS ELEMENTOS DEL ARRAY
    Array.prototype.sum = function(ignoraNegativos) {
        var sum = 0,
            ln = this.length,
            i;

        for (i = 0; i < ln; i++) {
            if (typeof(this[i]) === 'number') {

                if (ignoraNegativos && this[i] < 0) {
                    continue;
                } else {
                    sum += this[i];
                }
            }
        }

        return sum;
    }

    function grados_a_radianes(grados) {

        return Math.PI / 180 * grados;
    }

    function rd3(maxi, dato, medida) {
        // la variable medida es la que marca. 180 es un hemiciclo, 360 es un circulo completo
        var mx = +maxi,
            med = (medida) ? medida : 100;
        return (dato * med) / mx;
    }

    function calcArrayPercents(arr) {

        var sum = arr.sum(),
            parciales = [],
            ln = arr.length,
            calc,
            i;

        for (i = 0; i < ln; i++) {
            calc = (arr[i] * 100) / sum;
            parciales.push(calc >= 0 ? calc : 0);
        }

        return parciales;
    }



    var es_ES = {
            "decimal": ",",
            "thousands": ".",
            "grouping": [3],
            "currency": ["€", ""],
            "dateTime": "%a %b %e %X %Y",
            "date": "%d/%m/%Y",
            "time": "%H:%M:%S",
            "periods": ["AM", "PM"],
            "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
            "shortDays": ["Dom", "Lun", "Mar", "Mi", "Jue", "Vie", "Sab"],
            "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
            "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        },
        en_US = {
            "decimal": ".",
            "thousands": ",",
            "grouping": [3],
            "currency": ["$", ""],
            "dateTime": "%a %b %e %X %Y",
            "date": "%m/%d/%Y",
            "time": "%H:%M:%S",
            "periods": ["AM", "PM"],
            "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        },
        ES = d3.locale(es_ES),
        ENUS = d3.locale(en_US),
        iso = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ"),
        tooltipDateFormat = ENUS.timeFormat("%A %d, %H:%M")






    var tablaIdsOrdenados = ['eol', 'hid', 'sol', 'aut', 'gf', 'nuc', 'car', 'cc'],
        tablaIdsInfo = {
            'eol': {
                'id': 'eol',
                'nombre': 'Wind',
                'nombreAbrev': 'Wind',
                'color': '7EAADD',
                'highlightColor': 'c6d1dd',
                'icon': '\\e82b',
            },
            'hid': {
                'id': 'hid',
                'nombre': 'Hydroelectric',
                'nombreAbrev': 'Hydroelectric',
                'color': '33537A',
                'highlightColor': '446fa4',
                'icon': '\\e82d'
            },
            'sol': {
                'id': 'sol',
                'nombre': 'Solar/Solar Thermal',
                'nombreAbrev': 'Solar/S.Thermal',
                'color': 'F5A623',
                'highlightColor': 'f5cc89',
                'icon': '\\e82c'
            },
            'aut': {
                'id': 'aut',
                'nombre': 'Special Scheme',
                'nombreAbrev': 'Special S.',
                'color': '9B9B9B',
                'highlightColor': 'bdbdbd',
                'icon': '\\e800'
            },
            'gf': {
                'id': 'gf',
                'nombre': 'Gas + Fuel',
                'nombreAbrev': 'Gas+Fuel',
                'color': '6F93A4',
                'highlightColor': '96C6DD',
                'icon': '\\e806'
            },
            'nuc': {
                'id': 'nuc',
                'nombre': 'Nuclear',
                'nombreAbrev': 'Nuclear',
                'color': 'BD10E0',
                'highlightColor': 'd712ff',
                'icon': '\\e807'
            },
            'car': {
                'id': 'car',
                'nombre': 'Coal',
                'nombreAbrev': 'Coal',
                'color': '583636',
                'highlightColor': '795d5d',
                'icon': '\\e805'
            },
            'cc': {
                'id': 'cc',
                'nombre': 'Combined Cycle',
                'nombreAbrev': 'Combined C.',
                'color': '3D4163',
                'highlightColor': '686fa9',
                'icon': '\\e804'
            }
        },
        tablaIdsConsumos = {
            'eol': {
                'med24h': 0,
                'percent24h': []
            },
            'hid': {
                'med24h': 0,
                'percent24h': []
            },
            'sol': {
                'med24h': 0,
                'percent24h': []
            },
            'aut': {
                'med24h': 0,
                'percent24h': []
            },
            'gf': {
                'med24h': 0,
                'percent24h': []
            },
            'nuc': {
                'med24h': 0,
                'percent24h': []
            },
            'car': {
                'med24h': 0,
                'percent24h': []
            },
            'cc': {
                'med24h': 0,
                'percent24h': []
            }
        },
        tablaEmisiones = {
            "icb": 0,
            "inter": 0,
            "car": 0.95,
            "aut": 0.27,
            "sol": 0,
            "cc": 0.37,
            "hid": 0,
            "gf": 0.7,
            "nuc": 0,
            "eol": 0
        },
        parametrosUsados = {
            'dem': true,
            'icb': true,
            'inter': true,
            'car': true,
            'aut': true,
            'sol': true,
            'cc': true,
            'hid': true,
            'gf': true,
            'nuc': true,
            'eol': true,
            'ts': true
        },
        energiasMostradas = {
            'icb': true,
            'inter': true,
            'car': true,
            'aut': true,
            'sol': true,
            'cc': true,
            'hid': true,
            'gf': true,
            'nuc': true,
            'eol': true
        };


    //DIBUJO BASE 

    var svg = d3.select("#chart").append('svg')
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)

    var defs = svg.append("defs"),
        filter = defs.append("filter")
        .attr("id", "brightness"),
        feComponent = filter.append("feComponentTransfer");
    feComponent.append('feFuncR')
        .attr('type', 'linear')
        .attr('slope', '1.25')
    feComponent.append('feFuncG')
        .attr('type', 'linear')
        .attr('slope', '1.25')
    feComponent.append('feFuncB')
        .attr('type', 'linear')
        .attr('slope', '1.25')

    //.style("filter", "url(#brightness)")  


    svg.append('rect')
        .attr('id', 'bg')
        .attr({
            'x': 0,
            'y': 0,
            'width': canvasWidth,
            'height': canvasHeight,
            'fill': '#2f2f2f'
        });

    svg.append('g').attr('id', 'base');

    svg.append('circle')
        .attr('id', 'circleBG')
        .attr('r', radio)
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('fill', '#222222');


    // CREO LOS HOST PARA LOS 'RADIOS'

    svg.append('g').attr('id', 'horas');

    var hostRads = svg.append('g').attr('id', 'hostRads'),
        groupCircle = svg.append('g').attr('id', 'consumo'),
        consumoCircle = groupCircle.append('circle')
        .attr('r', radio)
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('stroke', '#990000')
        .attr('fill', 'none')
        .attr('stroke-dasharray', 3)
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0);

    var groupConsumo = svg.append('g').attr('id', 'consumo-dot'),
        consumoDot = groupConsumo.append('circle')
        .attr('r', 5)
        .attr('cx', -9999)
        .attr('cy', -9999)
        .attr('stroke', 'none')
        .attr('fill', '#900')


    var grupoHoras = d3.select("svg #horas")
        .attr('transform', 'translate(' + centerX + ',' + centerY + ')');

    // PASAR MINUTOS 24*60 
    var horaRotation = d3.scale.linear()
        .domain([0, 24 * 60])
        .range([0, 360]);

    var hoy = new Date();
    var currentHourRotation = horaRotation((60 * hoy.getHours()) + hoy.getMinutes());

    var circleHour = svg.append('circle')
        .attr('id', 'circleHour')
        .attr('r', 3)
        .attr('cx', centerX + (radio + 12) * Math.sin(grados_a_radianes(180 + 360 - currentHourRotation)))
        .attr('cy', centerY + (radio + 12) * Math.cos(grados_a_radianes(180 + 360 - currentHourRotation)))
        .attr('stroke-width', '2')
        .attr('stroke', '#BCD5D5')
        .attr('fill', '#BCD5D5');

    var clockTimer = setInterval(function() {

        var date = new Date(),
            currentHourRotation = horaRotation((60 * date.getHours()) + date.getMinutes()),
            calc = grados_a_radianes(180 + 360 - currentHourRotation);

        circleHour.transition()
            .attr('cx', centerX + radioHours * Math.sin(calc))
            .attr('cy', centerY + radioHours * Math.cos(calc))
            .attr('r', function() {
                return ((circleHour.attr('r') != 3) ? 3 : 1);
            });
    }, 1000);

    // DIBUJO LAS 24 HORAS

    var rotation,
        n,
        lnHoras = 24;

    for (n = 0; n < lnHoras; n++) {
        rotation = 180 - (360 / lnHoras) * n;
        grupoHoras.append('text')
            .text(((n > 9) ? n : "0" + n) + ':00')
            .attr('x', (radio + 33) * Math.sin(grados_a_radianes(rotation)))
            .attr('y', (radio + 33) * Math.cos(grados_a_radianes(rotation)) + 7)
            .attr('text-anchor', 'middle')
            .style('font-size', '14')
            .style('font-family', 'Roboto Slab, Helvetica Neue, Helvetica, sans-serif')
            .style('fill', '#666')
    }

    // PINTO EL DESGLOSE

    var desglose = svg.append('g')
        .attr('id', 'desglose_grupo')
        .attr('transform', 'translate(' + (centerX + radio + 100) + ',' + (centerY - (radio * .75)) + ')')
        .attr('opacity', 0);

    desglose.append('rect')
        .attr('y', formulaRadioDesglose + 20)
        .attr('width', 165)
        .attr('height', 3)
        .attr('fill', '#3C3C3C');

    var fechaBloque = desglose.append('text')
        .text("hoy")
        .attr('y', formulaRadioDesglose + 39)
        .attr('text-anchor', 'start')
        .style('font-size', '14')
        .style('font-family', 'Roboto Slab, Helvetica Neue, Helvetica, sans-serif')
        .attr('fill', '#666'),
        horaBloque = desglose.append('text')
        .text("21:00h")
        .attr('y', formulaRadioDesglose + 62)
        .attr('text-anchor', 'start')
        .style('font-size', '27')
        .style('font-family', 'Roboto Slab, Helvetica Neue, Helvetica, sans-serif')
        .attr('fill', '#666'),
        desgloseBloqueRenovable = desglose.append('g'),
        altoRenovables = desgloseBloqueRenovable.append('rect')
        .attr('x', -8)
        .attr('width', 2)
        .attr('height', 200)
        .attr('fill', '#669C83'),
        textoRenovables = desgloseBloqueRenovable.append('text')
        .text("--")
        .attr('text-anchor', 'middle')
        .style('font-size', '13')
        .style('font-family', 'Roboto Slab, Helvetica Neue, Helvetica, sans-serif')
        .attr('fill', '#669C83')
        .attr('x', -100)
        .attr('y', -12)
        .attr('transform', 'rotate(-90)')


    // PINTO EL TOOLTIP
    var tooltipWidth = 120,
        tooltipHeight = 28,
        currentTooltipFormat,
        tooltip = svg.append('g').attr('id', 'dem-tooltip').attr('opacity', 0),
        tooltip_shadow = tooltip.append('rect')
        .attr({
            'width': tooltipWidth + 4,
            'height': tooltipHeight + 4,
            'fill': 'black',
            'fill-opacity': .15
        }),
        tooltip_rect = tooltip.append('rect')
        .attr({
            'width': tooltipWidth,
            'height': tooltipHeight
        }),
        tooltip_fecha = tooltip.append('text')
        .attr('id', 'fecha')
        .attr('x', 5)
        .attr('y', 11)
        .attr('text-anchor', 'start')
        .style('font-size', '11')
        .style('font-family', 'Roboto Slab, Helvetica Neue, Helvetica, sans-serif')
        .style('fill', 'black')
        .style('fill-opacity', .75),
        tooltip_mw = tooltip.append('text')
        .text('')
        .attr('x', 15)
        .attr('y', 24)
        .style('font-size', '13')
        .style('font-family', 'Roboto Slab, Helvetica Neue, Helvetica, sans-serif')
        .style('fill', 'white');



    function setTooltip(name) {


        if (name == 'fmt_0_0') {

            tooltip_shadow
                .attr({
                    'x': -(tooltipWidth + 2),
                    'y': -(tooltipHeight + 2)
                });

            tooltip_rect
                .attr({
                    'x': -tooltipWidth,
                    'y': -tooltipHeight
                });

            tooltip_fecha
                .attr({
                    'x': -4,
                    'y': -16,
                    'text-anchor': 'end'
                });

            tooltip_mw
                .attr({
                    'x': -4,
                    'y': -4,
                    'text-anchor': 'end'
                });


        }

        if (name == 'fmt_1_0') {

            tooltip_shadow
                .attr({
                    'x': -2,
                    'y': -(tooltipHeight + 2)
                });

            tooltip_rect
                .attr({
                    'x': 0,
                    'y': -tooltipHeight
                });

            tooltip_fecha
                .attr({
                    'x': 5,
                    'y': -16,
                    'text-anchor': 'start'
                });

            tooltip_mw
                .attr({
                    'x': 5,
                    'y': -4,
                    'text-anchor': 'start'
                });

        }
        if (name == 'fmt_1_1') {
            tooltip_shadow
                .attr({
                    'x': -2,
                    'y': -2
                });

            tooltip_rect
                .attr({
                    'x': 0,
                    'y': 0
                });

            tooltip_fecha
                .attr({
                    'x': 5,
                    'y': 11,
                    'text-anchor': 'start'
                });

            tooltip_mw
                .attr({
                    'x': 5,
                    'y': 24,
                    'text-anchor': 'start'
                });

        }
        if (name == 'fmt_0_1') {
            tooltip_shadow
                .attr({
                    'x': -(tooltipWidth + 2),
                    'y': -2
                });

            tooltip_rect
                .attr({
                    'x': -tooltipWidth,
                    'y': 0
                });

            tooltip_fecha
                .attr({
                    'x': -4,
                    'y': 11,
                    'text-anchor': 'end'
                });

            tooltip_mw
                .attr({
                    'x': -4,
                    'y': 24,
                    'text-anchor': 'end'
                });

        }


    }

    function mousemove(d, i) {

        var coords = d3.mouse(this),
            x = coords[0],
            y = coords[1],
            mth = Math,
            xs = mth.pow(centerX - x, 2),
            ys = mth.pow(centerY - y, 2),
            sqrt = mth.sqrt(xs + ys),
            offset = {
                'left': svg.offsetLeft,
                'top': svg.offsetTop
            },
            xsign = (x > centerX) ? 1 : 0,
            ysign = (y > centerY) ? 1 : 0,
            tooltipFmtName = ['fmt_', xsign, '_', ysign].join("");

        if (tooltipFmtName != currentTooltipFormat) {
            setTooltip(tooltipFmtName);
            currentTooltipFormat = tooltipFmtName;
        }

        if (isOuterRadio != +(sqrt <= radio)) {



            isOuterRadio = +(sqrt <= radio);

            groupCircle.transition().duration(100).style('opacity', isOuterRadio);
            groupConsumo.transition().duration(100).style('opacity', isOuterRadio);
            tooltip.transition().duration(100).style('opacity', isOuterRadio);

            if (!isOuterRadio) {
                dispatch.mouseenter(this, lastJsonData);
            }

        }

    }


    svg.on('mousemove', mousemove)


    function demFn(d) {
        return +d.dem;
    }

    function idFn(d) {
        return d.id;
    }

    var sizes = d3.scale.linear()
        .range([10, 24]),
        opacityScale = d3.scale.linear()
        .range([.4, 1]),
        colorDemand = d3.scale.linear()
        .range(['#996A00', '#990000']);

    // ESTA ESCALA ME PERMITE ESTABLECER EL MÁXIMO Y MÍNIMO CONSUMO EN FUNCIÓN DE LA DEMANDA
    // Y VARIAR EL MÁXIMO PORCENTAJE DE RADIO

    var scaleRadius = d3.scale.linear()
        .range([0, radio]);

    var dispatch = d3.dispatch("mouseenter");
    dispatch.on("mouseenter", debounce(pintaDesglose, 125))


    //http://davidwalsh.name/javascript-debounce-function

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    function pintaDesglose(evt, datos) {

        // CALCULAMOS LA SUMA DE LAS DIFERENTES ENERGÍAS PROVEEDORAS
        var generadoras = [datos.eol, datos.hid, datos.sol, datos.aut, datos.gf, datos.nuc, datos.car, datos.cc],
            porcentajesDemanda = calcArrayPercents(generadoras),
            demandaHora = generadoras.sum(true);


        var acumuladoInner = 0,
            grosorGeneradora = 0,
            ln = porcentajesDemanda.length,
            tsDate = iso.parse(datos.ts),
            h = tsDate.getHours(),
            m = tsDate.getMinutes(),
            ecoPercent = rd3(demandaHora, [datos.eol, datos.hid, datos.sol].sum(true)),
            path,
            i;


        desglose
            .attr('opacity', 1)

        textoRenovables.text("Renewable " + ENUS.numberFormat(",.2f")(ecoPercent) + "% ")
            .transition()
            .attr('x', -(formulaRadioDesglose / 100 * ecoPercent) / 2)

        altoRenovables
            .transition()
            .attr('height', (formulaRadioDesglose / 100 * ecoPercent))

        fechaBloque
            .text(ENUS.timeFormat("%A %d")(tsDate))

        horaBloque
            .text(ENUS.timeFormat("%H:%M")(tsDate) + "h")

        var scaleDesglose = d3.scale.linear()
            .range([0, formulaRadioDesglose]),
            tabla = [];

        for (i = 0; i < tablaIdsOrdenados.length; i++) {
            tabla[i] = {
                id: tablaIdsOrdenados[i],
                datos: datos[tablaIdsOrdenados[i]]
            };
        }


        var bloques = desglose.selectAll('.j-bloque')
            .data(tabla, function(d, i) {
                return d.id;
            });

        bloques.enter()
            .append('g')
            .attr('id', function(d, i) {
                return "des_" + d.id;
            })
            .attr('class', 'j-bloque')
            .each(function() {
                var that = d3.select(this);

                that.append('rect')
                    .attr('width', 6)
                    .attr('height', 10)
                    .attr('fill', function(d) {
                        return '#' + tablaIdsInfo[d.id].color;
                    });

                that.append('text')
                    .text(function(d) {
                        return tablaIdsInfo[d.id].id;
                    })
                    .attr('class', 'j-nombre')
                    .attr('x', 30)
                    .attr('y', 20)
                    .attr('text-anchor', 'start')
                    .style('font-size', '13')
                    .style('font-family', 'Roboto Slab, Helvetica Neue, Helvetica, sans-serif')
                    .style('fill', '#B3B3B3')
                    .style('fill', function(d) {
                        return '#' + tablaIdsInfo[d.id].highlightColor;
                    })
                    .attr('transform', 'rotate(-45)');

                that.append('text')
                    .text(function(d) {
                        return tablaIdsInfo[d.id].id;
                    })
                    .attr('class', 'j-MW')
                    .attr('x', 30)
                    .attr('y', 32)
                    .attr('text-anchor', 'start')
                    .style('font-size', '12')
                    .style('font-family', 'Roboto Slab, Helvetica Neue, Helvetica, sans-serif')
                    .style('fill', '#B3B3B3')
                    .style('fill', function(d) {
                        return '#' + tablaIdsInfo[d.id].highlightColor;
                    })
                    .attr('transform', 'rotate(-45)');

                that.append('path')
                    .style('fill', 'none')
                    .style('stroke-width', '1')
                    .style('stroke', function(d) {
                        return '#' + tablaIdsInfo[d.id].color;
                    })


            }).attr('transform', function(d, i) {

                return 'translate(0,' + (50 * i) + ')'

            })


        //UPDATE
        var safeStep = 33,
            safeStepCalc = 0,
            colisionCounter = 0,
            minPercentStep = 8;

        bloques.each(function(d, i) {


            if (porcentajesDemanda[i - 1] < minPercentStep) {
                colisionCounter++;
            }


            safeStepCalc = safeStep * colisionCounter;
            grosorGeneradora = porcentajesDemanda[i] / 100 * formulaRadioDesglose;


            var that = d3.select(this)
                .transition()
                .attr('transform', 'translate(0,' + acumuladoInner + ')')
                .each(function() {
                    var that = d3.select(this);
                    that.select('rect')
                        .transition()
                        .attr('height', grosorGeneradora);

                    that.select('.j-nombre')
                        .text(function(d) {
                            return tablaIdsInfo[d.id].nombreAbrev + " ";
                        })
                        .transition()
                        .attr('transform', 'translate(' + safeStepCalc + ',' + 0 + ') ' + 'rotate(-45 0 0) ');

                    that.select('.j-MW')
                        .text(function(d) {
                            return ENUS.numberFormat(",.2f")(porcentajesDemanda[i]) + "% " + ENUS.numberFormat(",.")(d.datos) + "MW ";
                        })
                        .transition()
                        .attr('transform', 'translate(' + safeStepCalc + ',' + 0 + ') ' + 'rotate(-45 0 0) ');

                    that.select('path')
                        .transition()
                        .attr('d', 'M6,1 H' + Math.floor(31 + safeStepCalc) + " l3,-3")

                })


            acumuladoInner += grosorGeneradora;
        })
    }

    function getData(path) {

        d3.json(path, function(error, data) {

            if (error) throw error;

            // LIMPIO LOS DATOS DEL JSON NO UTILIZADOS

            var datosJson = data.map(function(obj) {
                // REMAPEO EL OBJETO PARA ELIMINAR ALGUNOS DATOS NO UTILIZADOS DEL JSON
                var tmpObj = {},
                    key;

                for (key in obj) {

                    if (parametrosUsados[key]) {
                        tmpObj[key] = obj[key];
                    }

                }

                return tmpObj;

            });


            datosJson.reverse();


            var maxDemand = d3.max(datosJson, demFn),
                minDemand = d3.min(datosJson, demFn),
                generadoras = [];

            //RESET

            for (key in tablaIdsConsumos) {

                tablaIdsConsumos[key].percent24h = [];
                tablaIdsConsumos[key].med24h = 0;
            }

            datosJson.forEach(function(value) {

                var generadoras = [],
                    porcentajesDemanda,
                    key,
                    i = 0;

                //RESET

                for (key in tablaIdsConsumos) {
                    generadoras.push(value[key]);
                }

                porcentajesDemanda = calcArrayPercents(generadoras);

                for (key in tablaIdsConsumos) {
                    tablaIdsConsumos[key].percent24h.push(porcentajesDemanda[i]);
                    i++;
                }

            })

            for (key in tablaIdsConsumos) {
                tablaIdsConsumos[key].med24h = d3.mean(tablaIdsConsumos[key].percent24h);
            }


            console.log('min', minDemand, 'max', maxDemand, 'length', datosJson.length);

            // ACTUALIZO DOMAINS SCALES
            sizes.domain([minDemand, maxDemand])
            opacityScale.domain([0, datosJson.length])
            colorDemand.domain([minDemand, maxDemand])

            // ESTA ESCALA ME PERMITE ESTABLECER EL MÁXIMO Y MÍNIMO CONSUMO EN FUNCIÓN DE LA DEMANDA
            // Y VARIAR EL MÁXIMO PORCENTAJE DE RADIO
            scaleRadius.domain([0, maxDemand])


            var now = new Date(),
                currentHourDate = iso.parse(datosJson[datosJson.length - 1].ts),
                currentHourDateRotation = horaRotation((currentHourDate.getHours() * 60) + (currentHourDate.getMinutes())),
                arcoPorcion = (360 / datosJson.length) / 1.05;

            // LANZO EL ÚLTIMO DATO DISPONIBLE

            if (!isOuterRadio) {
                dispatch.mouseenter(this, datosJson[datosJson.length - 1]);
            }

            // SELECCIONO LOS RADIOS QUE ALBERGAN CADA UNA DE LAS FRANJAS DE TIEMPO

            var rads = svg.select('#hostRads').selectAll('.rad')
                .data(datosJson, function(d) {
                    return d.ts;
                });


            // ENTER

            rads.enter().append('g')
                .attr('class', 'rad')
                .attr('id', function(d) {
                    var ts = iso.parse(d.ts)
                    return ['id-', ts.getHours(), ':', ts.getMinutes(), '-dia-', ts.getDate()].join("");
                })
                .on('mouseenter', function(d) {

                    dispatch.mouseenter(this, d);

                    /*var that = d3.select(this)
                        that.style("filter", "url(#brightness)")  */

                    var tsDate = iso.parse(d.ts),
                        h = tsDate.getHours(),
                        m = tsDate.getMinutes(),
                        angle = horaRotation((h * 60) + m),
                        offset = 180,
                        a = grados_a_radianes(offset - angle),
                        consumoRadio = scaleRadius(d.dem),
                        sinA = Math.sin(a),
                        cosA = Math.cos(a);

                    consumoDot
                        .attr('cx', centerX + (consumoRadio * sinA))
                        .attr('cy', centerY + (consumoRadio * cosA))
                        .transition()
                        .duration(150)
                        .attr('fill', colorDemand(d.dem))


                    tooltip
                        .attr('transform', 'translate(' + (centerX + (consumoRadio * sinA)) + ',' + (centerY + (consumoRadio * cosA)) + ')')

                    tooltip_fecha
                        .text(function() {
                            var tsDate = iso.parse(d.ts);
                            return tooltipDateFormat(tsDate);
                        });

                    tooltip_mw
                        .text(function() {
                            return ENUS.numberFormat(",.")(d.dem) + "MW";
                        });

                    tooltip_rect
                        .attr('fill-opacity', 1)
                        .transition()
                        .duration(150)
                        .attr('fill', colorDemand(d.dem));

                    consumoCircle
                        .attr('stroke-opacity', .9)
                        .transition()
                        .attr({
                            'r': function() {
                                return scaleRadius(d.dem);
                            },
                            'stroke': function() {
                                return colorDemand(d.dem);
                            }
                        })



                })
                /*
                                .on('mouseleave',function(){

                                    var that = d3.select(this);
                                        that.style("filter", "none")  


                                })*/
                .each(function(d) {

                    //CREO LOS 'HUECOS'
                    var group = d3.select(this),
                        ln = 8,
                        n = 0;


                    group.selectAll('path')
                        .data(tablaIdsOrdenados)
                        .enter().append('path')
                        .on('click', function() {
                            var that = d3.select(this);
                            console.log("click", iso.parse(d.ts), that.datum(), d[that.datum()])
                        })
                        .on('mouseover', function() {
                            var that = d3.select(this);
                            that
                                .attr('fill', '#' + tablaIdsInfo[that.datum()].highlightColor);
                        })
                        .on('mouseout', function() {
                            var that = d3.select(this);
                            that
                                .attr('fill', '#' + tablaIdsInfo[that.datum()].color);
                        })
                        .attr('fill', function(d, n) {
                            var that = d3.select(this)
                            return '#' + tablaIdsInfo[that.datum()].color;
                        })


                    n++;


                })
                .attr('opacity', 0)
                .attr('transform', 'translate(' + centerX + ',' + centerY + ')')

            ;

            // UPDATE

            rads.each(function(d, i) {

                //console.log ('rad',i, this.id);
                paths = d3.select(this).selectAll('path')

                // CALCULAMOS LA SUMA DE LAS DIFERENTES ENERGÍAS PROVEEDORAS
                var generadoras = [d.eol, d.hid, d.sol, d.aut, d.gf, d.nuc, d.car, d.cc],
                    porcentajesDemanda = calcArrayPercents(generadoras),
                    demandaHora = generadoras.sum(true),
                    acumuladoInner = 0,
                    grosorGeneradora = 0,
                    ln = porcentajesDemanda.length,
                    n = 0,
                    arc = d3.svg.arc(),
                    tsDate = iso.parse(d.ts),
                    h = tsDate.getHours(),
                    m = tsDate.getMinutes(),
                    angle = horaRotation((h * 60) + m),
                    path;



                paths.each(function() {

                    grosorGeneradora = porcentajesDemanda[n] / 100 * scaleRadius(d.dem);

                    d3.select(this).attr('d', arc.startAngle(function() {
                            return grados_a_radianes(angle);
                        }).endAngle(function() {
                            return grados_a_radianes(angle + arcoPorcion);
                        }).outerRadius(function() {
                            return grosorGeneradora + acumuladoInner;
                        }).innerRadius(function() {
                            return acumuladoInner;
                        }))
                        //.attr('shape-rendering','optimizeSpeed' )

                    acumuladoInner += grosorGeneradora;

                    n++;


                })

            });

            rads.transition().duration(500).delay(function(d, i) {
                    return (datosJson.length - i) * 25
                })
                .attr('opacity', function(d, i) {
                    return opacityScale(i);
                })
                .attr('transform', 'translate(' + centerX + ',' + centerY + ')');

            //EXIT
            rads.exit().remove()
                .each(function() {
                    console.log('Bye! exit ', this);
                });



            var dLast = lastJsonData = datosJson[datosJson.length - 1],
                generadoras = [dLast.eol, dLast.hid, dLast.sol, dLast.aut, dLast.gf, dLast.nuc, dLast.car, dLast.cc],
                porcentajesDemanda = calcArrayPercents(generadoras),
                demandaHora = generadoras.sum(true),
                id;

            //ACTUALIZO HTML

            var energias = d3.select('#j-energias').selectAll(".energia")
                .data(tablaIdsOrdenados);

            energias.each(function(d, i) {

                var datos = tablaIdsInfo[d],
                    that = d3.select(this),
                    id = d;

                that.select('.energia__titulo')
                    .text(datos.nombre) //.text(that.datum().nombre)
                    .style('color', datos.highlightColor);
                that.selectAll('.energia__subtitulo')
                    .data(['Current Contribution', 'Average 24h', 'Emissions CO<sub>2</sub>'])
                    .each(function(d) {
                        d3.select(this)
                            .html(function() {
                                return d;
                            })
                    });

                that.select('.j-porcentaje-' + id)
                    .text(function() {
                        return ENUS.numberFormat(",.2f")(rd3(demandaHora, +dLast[id])) + "%";
                    });
                that.select('.j-valor-' + id).transition()
                    .text(function() {
                        return ENUS.numberFormat(",.")(dLast[id]) + "MW";
                    });
                that.select('.j-porcentaje-media-' + id)
                    .text(function() {
                        return ENUS.numberFormat(",.2f")(tablaIdsConsumos[id].med24h) + "%";
                    });
                that.select('.j-aportacion-media-' + id)
                    .text(function() {
                        return ENUS.numberFormat(",.2f")(d3.mean(datosJson, function(d) {
                            return d[id];
                        })) + "MW";
                    });
                that.select('.j-co2-' + id)
                    .text(function() {
                        return ENUS.numberFormat(",.2f")(+dLast[id] * tablaEmisiones[id]) + 'T/h';
                    });

                try {
                    document.styleSheets[0].addRule('#id_' + id + ':before', 'content: "' + datos.icon + '"; color:' + datos.highlightColor + ';');
                } catch (err) {
                    console.log(err)
                }

                that.style('opacity', .5)
                    .transition().delay(i * 100)
                    .style('opacity', 1)


            });


        })
    }



    //    var baseUrl = "https://energia-ngpt.rhcloud.com/data/last24h";
    var baseUrl = "../data/last24h";


    setInterval(getData, 1000 * 30, baseUrl);
    getData(baseUrl);


})()
