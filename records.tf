resource "aws_route53_record" "certRecord" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      record  = dvo.resource_record_value
      type    = dvo.resource_record_type
      zone_id = aws_route53_zone.hostedZone.zone_id
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = each.value.zone_id


}

#www  cert
resource "aws_route53_record" "record" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = "www.gregchow.net"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.distribution.domain_name
    zone_id                = aws_cloudfront_distribution.distribution.hosted_zone_id
    evaluate_target_health = true
  }
}

#root cert
resource "aws_route53_record" "rootRecord" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = "gregchow.net"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.rootDistribution.domain_name
    zone_id                = aws_cloudfront_distribution.rootDistribution.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "record6" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = "www.gregchow.net"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.distribution.domain_name
    zone_id                = aws_cloudfront_distribution.distribution.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "rootRecord6" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = "gregchow.net"
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.rootDistribution.domain_name
    zone_id                = aws_cloudfront_distribution.rootDistribution.hosted_zone_id
    evaluate_target_health = true
  }
}


#records for home lab server nginx reverse proxy
resource "aws_route53_record" "nginxRecord" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = "*.gregchow.net"
  type    = "A"
  ttl     = "60"
  records = ["192.168.55.15"]
 }

resource "aws_route53_record" "proxmoxRecord" {
  zone_id = aws_route53_zone.hostedZone.zone_id
  name    = "promxox.gregchow.net"
  type    = "A"
  ttl     = "60"
  records = ["192.168.55.5"]
}


