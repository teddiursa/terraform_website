resource "aws_route53_zone" "hostedZone" {
  name = var.domainName
}

resource "aws_route53domains_registered_domain" "domain" {
  domain_name = var.domainName
  #domain_name = "gregchow.net"

  #set name servers of registered domain to match hosted zone
  dynamic "name_server" {
    for_each = toset(aws_route53_zone.hostedZone.name_servers)
    content {
      name = name_server.value
    }
  }

  tags = {
    Environment = var.domainName
  }
}

resource "aws_acm_certificate" "cert" {
  domain_name               = var.domainName
  subject_alternative_names = [var.fullDomainName]
  validation_method         = "DNS"
  tags = {
    Name : var.domainName
  }

  lifecycle {
    create_before_destroy = true
  }
}


resource "aws_acm_certificate_validation" "certValidation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.certRecord : record.fqdn]
}
