(function($) {
    "use strict";

    /* ==============================================
    AFFIX
    =============================================== */
    $('.megamenu').affix({
        offset: {
            top: 800,
            bottom: function() {
                return (this.bottom = $('.footer').outerHeight(true))
            }
        }
    });

    /* ==============================================
    BACK TOP
    =============================================== */
    jQuery(window).scroll(function() {
        if (jQuery(this).scrollTop() > 1) {
            jQuery('.dmtop').css({
                bottom: "75px"
            });
        } else {
            jQuery('.dmtop').css({
                bottom: "-100px"
            });
        }
    });

    /* ==============================================
       LOADER
    =============================================== */
    $(window).on('load', function() {
        $("#preloader").on(500).fadeOut();
        $(".preloader").on(600).fadeOut("slow");
    });

    /* ==============================================
     FUN FACTS
    =============================================== */
    function count($this) {
        var current = parseInt($this.html(), 10);
        current = current + 50; /* Where 50 is increment */
        $this.html(++current);
        if (current > $this.data('count')) {
            $this.html($this.data('count'));
        } else {
            setTimeout(function() {
                count($this);
            }, 30);
        }
    }
    $(".stat_count, .stat_count_download").each(function() {
        $(this).data('count', parseInt($(this).html(), 10));
        $(this).html('0');
        count($(this));
    });

    /* ==============================================
     TOOLTIP & POPOVER
    =============================================== */
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();

    /* ==============================================
     CONTACT (AJAX SUBMIT LOGIC)
    =============================================== */
    jQuery(document).ready(function() {
        // Відкриття модального вікна
        function showSuccessModal(message) {
            const modal = $('#successModal');
            modal.find('.modal-body').text(message);
            modal.modal('show');
        }

        // 1) GET AN APPOINTMENT (#contactform)
        $('#contactform').submit(async function(e) {
            e.preventDefault(); // блокуємо дефолтний submit
            // Валідація форми
            let isValid = true;
            let errorMessage = '';

            const firstName = $('#first_name').val().trim();
            const lastName = $('#last_name').val().trim();
            const email = $('#email').val().trim();
            const phone = $('#phone').val().trim();
            const service = $('#select_service').val();
            const price = $('#select_price').val();

            if (!firstName || firstName.length < 2) {
                isValid = false;
                errorMessage += 'First name must be at least 2 characters long.\n';
            }

            if (!lastName || lastName.length < 2) {
                isValid = false;
                errorMessage += 'Last name must be at least 2 characters long.\n';
            }

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                isValid = false;
                errorMessage += 'Please enter a valid email address.\n';
            }

            if (!phone || !/^\+?\d{7,15}$/.test(phone)) {
                isValid = false;
                errorMessage += 'Please enter a valid phone number (7-15 digits).\n';
            }

            if (!isValid) {
                alert(errorMessage); // Виводимо повідомлення з помилками
                return; // Зупиняємо відправку форми, якщо є помилки
            }

            const action = $(this).attr('action'); // має бути "form-handler.php"
            const csrfToken = $('input[name="csrf_token"]').val(); // Получение CSRF-токена
            const $messageBlock = $("#message");
            $messageBlock.slideUp(750, function() {
                $messageBlock.hide();
            });

            // Кнопка Submit має id="submit"
            $('#submit')
                .after('<img src="" class="loader" />')
                .attr('disabled', 'disabled');

            // Формуємо об'єкт для відправки
            const formData = {
                first_name:      $('#first_name').val(),
                last_name:       $('#last_name').val(),
                email:           $('#email').val(),
                phone:           $('#phone').val(),
                select_service:  $('#select_service').val(),
                select_price:    $('#select_price').val(),
                comments:        $('#comments').val(),
                csrf_token: csrfToken // Добавление токена в запрос
            };

            try {
                const response = await $.ajax({
                    url: action,
                    type: 'POST',
                    data: formData,
                    dataType: 'json'  // очікуємо JSON від сервера
                });

                // Прибираємо loader
                $('#contactform img.loader').fadeOut('slow', function() {
                    $(this).remove();
                });
                $('#submit').removeAttr('disabled');

                // Обробляємо JSON-відповідь
                if (response.success) {
                    // Відображаємо модальне вікно замість
                    showSuccessModal(response.message);

                    // Показуємо повідомлення
                    $messageBlock.html(`<div class="success_message">${response.message}</div>`);
                    $messageBlock.slideDown('slow');

                    // Викликаємо трек-івент Facebook Pixel
                    if (typeof fbq === 'function') {
                        fbq('track', 'Lead');
                    }
                    // Викликаємо трек-івент Google Analytics
                    if (typeof gtag === 'function') {
                        gtag('event', 'form_submit', {
                            event_category: 'Forms',
                            event_label: 'GetAppointment'
                        });
                    }

                    // Ховаємо форму (якщо треба)
                    $('#contactform').slideUp('slow');

                    // Редирект (якщо задано)
                    if (response.redirectUrl) {
                        window.location.href = response.redirectUrl;
                    }
                } else {
                    // Якщо помилка (success=false)
                    $messageBlock.html(`<div class="error_message">${response.message}</div>`);
                    $messageBlock.slideDown('slow');
                }

            } catch (error) {
                // Якщо мережева помилка
                $('#contactform img.loader').remove();
                $('#submit').removeAttr('disabled');
                $messageBlock.html('<div class="error_message">Server error or network issue.</div>');
                $messageBlock.slideDown('slow');
            }
        });


        // 2) QUICK APPOINTMENT (#contactform1)
        $('#contactform1').submit(async function(e) {
            e.preventDefault();
            const form = $(this);

            // Валідація форми
            let isValid = true;
            let errorMessage = '';

            const firstName = $('#first_name1').val().trim();
            const lastName = $('#last_name1').val().trim();
            const email = $('#email1').val().trim();
            const phone = $('#phone1').val().trim();
            const service = $('#select_service1').val();
            const price = $('#select_price1').val();

            if (!firstName || firstName.length < 2) {
                isValid = false;
                errorMessage += 'First name must be at least 2 characters long.\n';
            }

            if (!lastName || lastName.length < 2) {
                isValid = false;
                errorMessage += 'Last name must be at least 2 characters long.\n';
            }

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                isValid = false;
                errorMessage += 'Please enter a valid email address.\n';
            }

            if (!phone || !/^\+?\d{7,15}$/.test(phone)) {
                isValid = false;
                errorMessage += 'Please enter a valid phone number (7-15 digits).\n';
            }

            if (!isValid) {
                alert(errorMessage); // Виводимо повідомлення з помилками
                return; // Зупиняємо відправку форми, якщо є помилки
            }

            const action = $(this).attr('action'); // form-handler.php
            const csrfToken = $('input[name="csrf_token"]').val(); // Получение CSRF-токена
            const $messageBlock = $("#message");
            $messageBlock.slideUp(750, function() {
                $messageBlock.hide();
            });

            // Кнопка Submit тут має id="submit1"
            $('#submit1')
                .after('<img src="" class="loader" />')
                .attr('disabled', 'disabled');

            // Формуємо об'єкт для відправки
            const formData = {
                first_name:      $('#first_name1').val(),
                last_name:       $('#last_name1').val(),
                email:           $('#email1').val(),
                phone:           $('#phone1').val(),
                select_service:  $('#select_service1').val(),
                select_price:    $('#select_price1').val(),
                csrf_token: csrfToken // Добавление токена в запрос
            };

            try {
                const response = await $.ajax({
                    url: action,
                    type: 'POST',
                    data: formData,
                    dataType: 'json'
                });

                // Прибираємо loader
                $('#contactform1 img.loader').fadeOut('slow', function() {
                    $(this).remove();
                });
                $('#submit1').removeAttr('disabled');

                // Обробляємо JSON-відповідь
                if (response.success) {
                    // Відображаємо модальне вікно замість
                    showSuccessModal(response.message);

                    // Показуємо повідомлення
                    $messageBlock.html(`<div class="success_message">${response.message}</div>`);
                    $messageBlock.slideDown('slow');

                    // Викликаємо трек-івент Facebook Pixel
                    if (typeof fbq === 'function') {
                        fbq('track', 'Lead');
                    }
                    // Викликаємо трек-івент Google Analytics
                    if (typeof gtag === 'function') {
                        gtag('event', 'form_submit', {
                            event_category: 'Forms',
                            event_label: 'QuickAppointment'
                        });
                    }

                    // Ховаємо форму (якщо треба)
                    $('#contactform1').slideUp('slow');

                    // Редирект (якщо вказано)
                    if (response.redirectUrl) {
                        window.location.href = response.redirectUrl;
                    }
                } else {
                    // Помилка
                    $messageBlock.html(`<div class="error_message">${response.message}</div>`);
                    $messageBlock.slideDown('slow');
                }

            } catch (error) {
                $('#contactform1 img.loader').remove();
                $('#submit1').removeAttr('disabled');
                $messageBlock.html('<div class="error_message">Server error or network issue.</div>');
                $messageBlock.slideDown('slow');
            }
        });
    });

    /* ==============================================
     CODE WRAPPER (DESIGN PREVIEW)
    =============================================== */
    $('.code-wrapper').on("mousemove", function(e) {
        var offsets = $(this).offset();
        var fullWidth = $(this).width();
        var mouseX = e.pageX - offsets.left;

        if (mouseX < 0) {
            mouseX = 0;
        } else if (mouseX > fullWidth) {
            mouseX = fullWidth;
        }

        $(this).parent().find('.divider-bar').css({
            left: mouseX,
            transition: 'none'
        });
        $(this).find('.design-wrapper').css({
            transform: 'translateX(' + (mouseX) + 'px)',
            transition: 'none'
        });
        $(this).find('.design-image').css({
            transform: 'translateX(' + (-1 * mouseX) + 'px)',
            transition: 'none'
        });
    });

    $('.divider-wrapper').on("mouseleave", function() {
        $(this).parent().find('.divider-bar').css({
            left: '50%',
            transition: 'all .3s'
        });
        $(this).find('.design-wrapper').css({
            transform: 'translateX(50%)',
            transition: 'all .3s'
        });
        $(this).find('.design-image').css({
            transform: 'translateX(-50%)',
            transition: 'all .3s'
        });
    });

})(jQuery);